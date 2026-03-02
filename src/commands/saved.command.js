export function registerSavedCommand(program, { config }) {
  program
    .command("saved")
    .description("View and manage saved commands")
    .option("-t, --tag <tag>", "Filter by tag")
    .option("-s, --search <keyword>", "Search commands by keyword")
    .option("-d, --delete <id>", "Delete a saved command by ID")
    .option("--tags", "Show all tags")
    .action(async (options) => {
      // saved handler with saved service and formatter
      console.log("Loading saved commands...");
    });
}
