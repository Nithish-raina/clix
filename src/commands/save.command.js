import { SaveService } from "../features/save/save.service.js";
import {
  printSaveConfirmation,
  printSaveError,
} from "../features/save/save.formatter.js";

export function registerSaveCommand(program, { config }) {
  program
    .command("save <command>")
    .description("Save a command for later use")
    .option("-t, --tag <tags...>", "Add tags for categorization")
    .option(
      "-d, --description <text>",
      "Add a description of what the command does",
    )
    .action(async (command, options) => {
      const saveService = new SaveService();

      const result = saveService.save({
        command,
        description: options.description || "",
        tags: options.tag || [],
      });

      if (!result.success) {
        printSaveError(result.error);
        return;
      }

      printSaveConfirmation(result.entry);
    });
}
