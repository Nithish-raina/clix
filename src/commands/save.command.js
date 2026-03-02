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
      // save handler with save service and formatter
      console.log("Saving command...");
    });
}
