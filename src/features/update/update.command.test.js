import { jest } from "@jest/globals";
import { Command } from "commander";
import { registerUpdateCommand } from "../../commands/update.command.js";

// --- Mocking the Service ---
const mockRunUpdate = jest.fn();
jest.unstable_mockModule("./update.service.js", () => ({
  UpdateService: jest.fn().mockImplementation(() => {
    return {
      runUpdate: mockRunUpdate,
    };
  }),
}));

const { UpdateService } = await import("./update.service.js");

describe("update.command", () => {
  let program;

  beforeEach(() => {
    jest.clearAllMocks();
    program = new Command();
  });

  it("should create an UpdateService and call its runUpdate method", async () => {
    const initialConfig = { model: "test-model", maxTokens: 1024 };
    registerUpdateCommand(program, { config: initialConfig });

    await program.parseAsync(["node", "test", "update"]);

    expect(UpdateService).toHaveBeenCalledTimes(1);
    expect(UpdateService).toHaveBeenCalledWith({ config: initialConfig });
    expect(mockRunUpdate).toHaveBeenCalledTimes(1);
  });
});
