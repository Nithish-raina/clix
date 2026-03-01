import { jest } from "@jest/globals";
import { Command } from "commander";

// --- Mocking the Service ---
const mockRunUpdate = jest.fn().mockResolvedValue();
jest.unstable_mockModule("./update.service.js", () => ({
  UpdateService: jest.fn().mockImplementation(() => {
    return {
      runUpdate: mockRunUpdate,
    };
  }),
}));

const { UpdateService } = await import("./update.service.js");
const { registerUpdateCommand } =
  await import("../../commands/update.command.js");

// Mock process.exit to prevent test runner from exiting
const exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});

describe("update.command", () => {
  let program;

  beforeEach(() => {
    jest.clearAllMocks();
    program = new Command();
    // Spy on console.log/error to prevent noisy output
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
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
