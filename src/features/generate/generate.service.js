import ora from "ora";
import { execSync } from "child_process";
import { confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { logger } from "../../utils/logger.js";
import {
  formatContextForPrompt,
  getStaticContext,
} from "../../context/static.js";
import { buildGeneratePrompt } from "./generate.prompts.js";
import { verifyTools } from "../../tools/verifier.js";

export class GenerateService {
  constructor({ aiProvider }) {
    this.aiProvider = aiProvider;
  }

  async generate(description) {
    const spinner = ora({
      text: "Collecting system info...",
      indent: 2,
    }).start();

    try {
      // 1. collect static context
      const systemContext = getStaticContext();
      const formattedContext = formatContextForPrompt(systemContext);
      spinner.succeed("System context loaded");

      // 2. first AI call
      spinner.start("Generating command...");
      let result = await this._callAI(description, formattedContext);
      spinner.stop();

      // 3. loop — AI may request context multiple times before it can generate
      const MAX_CONTEXT_ROUNDS = 3;
      let accumulatedContext = "";

      for (
        let round = 0;
        round < MAX_CONTEXT_ROUNDS && result.status === "needs_context";
        round++
      ) {
        const outcome = await this._handleContextRound(
          result,
          systemContext,
          spinner,
        );

        // user denied — try a best-guess generation with whatever context we have so far
        if (outcome.denied) {
          spinner.start("Generating command without context...");
          result = await this._callAI(
            description +
              "\n\nNote: user denied context gathering. Generate your best guess.",
            formattedContext,
            accumulatedContext || null,
          );
          spinner.stop();
          break;
        }

        if (!outcome.success) return null;

        accumulatedContext +=
          (accumulatedContext ? "\n\n---\n\n" : "") +
          `Context command: ${result.context_command}\nOutput:\n${outcome.output}`;

        spinner.start("Generating command...");
        result = await this._callAI(
          description,
          formattedContext,
          accumulatedContext,
        );
        spinner.stop();
      }

      if (result.status === "needs_context") {
        logger.error(
          "Could not generate a command: AI requested too many context rounds.",
        );
        return null;
      }

      if (!result.command) {
        logger.error("Could not generate a command.");
        return null;
      }

      return result;
    } catch (error) {
      spinner.stop();
      logger.error(`Error during command generation: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handles one round of context gathering: verifies tools, asks user permission,
   * and runs the context command.
   * Returns { denied: true }, { success: false }, or { success: true, output: string }.
   * @private
   */
  async _handleContextRound(result, systemContext, spinner) {
    // check if the context command's tools are available
    if (result.required_tools?.length > 0) {
      const verification = verifyTools(
        result.required_tools,
        systemContext.packageManagers,
      );

      if (!verification.allAvailable) {
        const installed = await this._handleMissingTools(
          verification.missing,
          spinner,
        );
        if (!installed) return { success: false };
      }
    }

    // show the user what command needs to run and why
    console.log();
    console.log(
      chalk.dim("  To generate an accurate command, clix needs to run:"),
    );
    console.log(`  ${chalk.cyan(result.context_command)}`);
    console.log(chalk.dim(`  Reason: ${result.context_explanation}`));
    console.log();

    const shouldRun = await confirm({
      message: "Allow this command to run?",
      default: true,
    });

    if (!shouldRun) {
      console.log(chalk.dim("\n  Trying to generate without context..."));
      return { denied: true };
    }

    // run the context command
    spinner.start("Gathering context...");
    const contextOutput = this._runCommand(result.context_command);

    if (!contextOutput.success) {
      spinner.fail("Context command failed");
      logger.error(contextOutput.output);
      return { success: false };
    }

    spinner.succeed("Context gathered");
    return { success: true, output: contextOutput.output };
  }

  /**
   * Handles installing missing tools required by the context command.
   * @private
   */
  async _handleMissingTools(missing, spinner) {
    for (const { tool, installSuggestions } of missing) {
      console.log();
      console.log(chalk.yellow(`'${tool}' is not installed but is needed.`));

      if (installSuggestions.length === 0) {
        console.log(
          chalk.dim(`Please install '${tool}' manually and try again.`),
        );
        return false;
      }

      const installCmd = installSuggestions[0];
      console.log(chalk.dim(`Install command: ${chalk.cyan(installCmd)}`));

      const shouldInstall = await confirm({
        message: `Install ${tool}?`,
        default: false,
      });

      if (!shouldInstall) {
        console.log(chalk.dim("  Skipped. Cannot proceed without this tool."));
        return false;
      }

      spinner.start(`Installing ${tool}...`);
      const installResult = this._runCommand(installCmd);

      if (!installResult.success) {
        spinner.fail(`Failed to install ${tool}`);
        logger.error(installResult.output);
        return false;
      }

      spinner.succeed(`${tool} installed`);
    }

    return true;
  }

  /**
   * Call AI provider and parse the response.
   * @private
   */
  async _callAI(description, formattedContext, dynamicContext = null) {
    const { systemPrompt, userMessage } = buildGeneratePrompt(
      description,
      formattedContext,
      dynamicContext,
    );

    const aiResponse = await this.aiProvider.complete({
      systemPrompt,
      userMessage,
    });

    return this._parseAIResponse(aiResponse.content);
  }

  /**
   * Run a shell command and capture its output.
   * @private
   */
  _runCommand(command) {
    try {
      const output = execSync(command, {
        encoding: "utf-8",
        timeout: 15000,
        stdio: ["ignore", "pipe", "pipe"],
      });
      return { success: true, output: output.trim() };
    } catch (e) {
      return { success: false, output: e.stderr || e.message };
    }
  }

  /**
   * Parse the AI response JSON string into an object.
   * @private
   */
  _parseAIResponse(content) {
    let cleaned = content.trim();

    if (cleaned.startsWith("```")) {
      const match = cleaned.match(/^```(?:json)?\n?([\s\S]*?)\n?```/);
      if (match) cleaned = match[1];
    }

    try {
      return JSON.parse(cleaned);
    } catch (err) {
      throw new Error(
        `Failed to parse AI response as JSON.\n` +
          `Raw response:\n${content.substring(0, 500)}`,
      );
    }
  }
}
