import { SavedService } from "../features/saved/saved.service.js";
import {
  printSavedCommands,
  printSavedError,
  printDeleteConfirmation,
  printTags,
} from "../features/saved/saved.formatter.js";

export function registerSavedCommand(program, { config }) {
  program
    .command("saved")
    .description("View and manage saved commands")
    .option("-t, --tag <tag>", "Filter by tag")
    .option("-s, --search <keyword>", "Search commands by keyword")
    .option("-d, --delete <id>", "Delete a saved command by ID")
    .option("--tags", "Show all tags")
    .action(async (options) => {
      const savedService = new SavedService();

      // handle --tags flag
      if (options.tags) {
        const tags = savedService.tags();
        printTags(tags);
        return;
      }

      // handle --delete flag
      if (options.delete) {
        await handleDelete(savedService, options.delete);
        return;
      }

      // default: list commands with optional filters
      const result = savedService.list({
        tag: options.tag,
        search: options.search,
      });

      printSavedCommands(result, {
        tag: options.tag,
        search: options.search,
      });
    });
}

async function handleDelete(savedService, id) {
  const result = savedService.delete(id);

  if (!result.success) {
    printSavedError(result.error);
    return;
  }

  printDeleteConfirmation(result.deleted);
}
