import { jest } from "@jest/globals";

// --- Mocking Dependencies ---
// We tell Jest to replace the real files with our fake (mocked) versions.
jest.unstable_mockModule("./explain.parser.js", () => ({
  validateCommand: jest.fn(),
  parseCommandInput: jest.fn(),
}));

jest.unstable_mockModule("../../safety/danger-scanner.js", () => ({
  scanForDanger: jest.fn(),
}));

// Now we can import the mocked functions to control them in our tests.
const { validateCommand, parseCommandInput } =
  await import("./explain.parser.js");
const { scanForDanger } = await import("../../safety/danger-scanner.js");

// Import the service under test dynamically so mocks apply first.
const { ExplainService } = await import("./explain.service.js");

// --- Test Suite ---
describe("ExplainService", () => {
  let explainService;
  let mockAiProvider;

  // This function runs before each test ("it" block) inside this suite.
  beforeEach(() => {
    // Reset all mocks to ensure tests are isolated from each other.
    jest.clearAllMocks();

    // Create a fake AI provider for our service to use.
    mockAiProvider = {
      name: "mock-ai",
      complete: jest.fn(), // jest.fn() creates a spy we can track.
    };

    // Create a new instance of our service for each test.
    explainService = new ExplainService({ aiProvider: mockAiProvider });
  });

  // --- Test Case 1: A simple, safe command ---
  it("should explain a safe command successfully", async () => {
    // 1. ARRANGE: Set up the world for our test.
    const command = "ls -l";
    const fakeAiResponse = {
      summary: "Lists files in long format.",
      danger_level: "safe",
      warnings: [],
    };

    // Control what our mocked functions will return when called.
    validateCommand.mockReturnValue({ valid: true });
    parseCommandInput.mockReturnValue({ command, isPiped: false });
    scanForDanger.mockReturnValue({ hasDanger: false, level: "safe" });
    mockAiProvider.complete.mockResolvedValue({
      content: JSON.stringify(fakeAiResponse),
      usage: { inputTokens: 10, outputTokens: 20 },
    });

    // 2. ACT: Run the method we want to test.
    const result = await explainService.explain(command);

    // 3. ASSERT: Check if everything happened as expected.
    expect(result.summary).toBe("Lists files in long format.");
    expect(result.danger_level).toBe("safe");
    expect(result.meta.provider).toBe("mock-ai");

    // Also, check if our dependencies were called correctly.
    expect(validateCommand).toHaveBeenCalledWith(command);
    expect(mockAiProvider.complete).toHaveBeenCalledTimes(1);
  });

  // --- Test Case 2: A dangerous command ---
  it("should merge local danger scan results with the AI response", async () => {
    // 1. ARRANGE
    const command = "sudo rm -rf /";
    const fakeAiResponse = {
      summary: "Deletes all files.",
      danger_level: "high", // AI thinks it's "high"
      warnings: ["This is a dangerous command."],
    };

    validateCommand.mockReturnValue({ valid: true });
    parseCommandInput.mockReturnValue({ command });
    // This time, our local scanner finds something critical!
    scanForDanger.mockReturnValue({
      hasDanger: true,
      level: "critical", // Local scanner says "critical"
      warnings: [{ message: "This can delete your entire system." }],
    });
    mockAiProvider.complete.mockResolvedValue({
      content: JSON.stringify(fakeAiResponse),
    });

    // 2. ACT
    const result = await explainService.explain(command);

    // 3. ASSERT
    // The final danger level should be "critical" because our local
    // scanner's result is more important than the AI's.
    expect(result.danger_level).toBe("critical");

    // The final warnings list should contain warnings from BOTH the
    // AI and our local scanner.
    expect(result.warnings).toHaveLength(2);
    expect(result.warnings).toContain("This can delete your entire system.");
  });

  // --- Test Case 3: The AI returns bad data ---
  it("should throw an error if the AI response is not valid JSON", async () => {
    // 1. ARRANGE
    const command = "echo 'hello'";
    validateCommand.mockReturnValue({ valid: true });
    parseCommandInput.mockReturnValue({ command });
    scanForDanger.mockReturnValue({ hasDanger: false });
    // Simulate the AI returning a broken or incomplete response.
    mockAiProvider.complete.mockResolvedValue({
      content: "This is not JSON {",
    });

    // 2. ACT & 3. ASSERT
    // We expect this test to fail (throw an error).
    // `expect().rejects` is how we test for errors in async functions.
    await expect(explainService.explain(command)).rejects.toThrow(
      "Failed to parse AI response as JSON",
    );
  });
});
