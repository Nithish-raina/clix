import { jest } from "@jest/globals";
// import { UpdateService } from "./update.service.js"; // Dynamic import at bottom
import { saveConfig } from "../../config/config.manager.js";
import { promptForModel, promptForMaxTokens } from "./update.prompts.js";

// Mock dependencies
jest.unstable_mockModule("../../config/config.manager.js", () => ({
  saveConfig: jest.fn(),
}));

jest.unstable_mockModule("./update.prompts.js", () => ({
  promptForModel: jest.fn(),
  promptForMaxTokens: jest.fn(),
}));

// Import mocks to control them
const { saveConfig: mockSaveConfig } =
  await import("../../config/config.manager.js");
const {
  promptForModel: mockPromptModel,
  promptForMaxTokens: mockPromptTokens,
} = await import("./update.prompts.js");

// Import SUT dynamically so mocks apply
const { UpdateService } = await import("./update.service.js");

describe("UpdateService", () => {
  let updateService;
  let mockConfig;
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfig = { model: "claude-haiku", maxTokens: 2048 };
    updateService = new UpdateService({ config: mockConfig });
    // Spy on console.log to avoid cluttering test output
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it("should update model when user selects a new one", async () => {
    // ARRANGE: User selects a new model, keeps max tokens same
    mockPromptModel.mockResolvedValue("claude-sonnet");
    mockPromptTokens.mockResolvedValue(null);

    // ACT
    await updateService.runUpdate();

    // ASSERT
    expect(mockSaveConfig).toHaveBeenCalledWith({
      model: "claude-sonnet",
      maxTokens: 2048,
    });
  });

  it("should update maxTokens when user enters a new value", async () => {
    // ARRANGE: User keeps model same, enters new max tokens
    mockPromptModel.mockResolvedValue(null);
    mockPromptTokens.mockResolvedValue(4096);

    // ACT
    await updateService.runUpdate();

    // ASSERT
    expect(mockSaveConfig).toHaveBeenCalledWith({
      model: "claude-haiku",
      maxTokens: 4096,
    });
  });

  it("should update both model and maxTokens", async () => {
    // ARRANGE
    mockPromptModel.mockResolvedValue("claude-sonnet");
    mockPromptTokens.mockResolvedValue(8192);

    // ACT
    await updateService.runUpdate();

    // ASSERT
    expect(mockSaveConfig).toHaveBeenCalledWith({
      model: "claude-sonnet",
      maxTokens: 8192,
    });
  });

  it("should NOT save config if no changes are made", async () => {
    // ARRANGE: User presses Enter (null) for both prompts
    mockPromptModel.mockResolvedValue(null);
    mockPromptTokens.mockResolvedValue(null);

    // ACT
    await updateService.runUpdate();

    // ASSERT
    expect(mockSaveConfig).not.toHaveBeenCalled();
  });

  it("should NOT save config if user selects same values", async () => {
    // ARRANGE: User enters values identical to current config
    mockPromptModel.mockResolvedValue("claude-haiku");
    mockPromptTokens.mockResolvedValue(2048);

    // ACT
    await updateService.runUpdate();

    // ASSERT
    expect(mockSaveConfig).not.toHaveBeenCalled();
  });
});
