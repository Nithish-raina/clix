import { scanForDanger } from "./danger-scanner.js";
import { DANGER_PATTERNS } from "../config/constants.js";

describe("danger-scanner", () => {
  it("should return hasDanger: false for a safe command", () => {
    const result = scanForDanger("ls -l --all");
    expect(result.hasDanger).toBe(false);
    expect(result.level).toBe("safe");
    expect(result.warnings).toHaveLength(0);
  });

  // Test cases for various dangerous commands
  const dangerTestCases = [
    {
      command: "sudo rm -rf /",
      expectedLevel: "critical",
      expectedMessage: "Potentially catastrophic command: `sudo rm` on root.",
    },
    {
      command: "mv my-file /dev/null",
      expectedLevel: "critical",
      expectedMessage:
        "Moving a file to /dev/null is equivalent to deleting it.",
    },
    {
      command: ":(){:|:&};:",
      expectedLevel: "high",
      expectedMessage: "This is a 'fork bomb' and will crash your system.",
    },
    {
      command: "rm -rf my_folder",
      expectedLevel: "medium",
      expectedMessage: "The `rm` command permanently deletes files.",
    },
    {
      command: "sudo apt-get update",
      expectedLevel: "medium",
      expectedMessage: "`sudo` executes commands with root privileges.",
    },
    {
      command: "wget http://example.com/script.sh",
      expectedLevel: "medium",
      expectedMessage: "Downloading from unencrypted HTTP URLs is insecure.",
    },
  ];

  test.each(dangerTestCases)(
    "should detect '$command' as $expectedLevel",
    ({ command, expectedLevel, expectedMessage }) => {
      const result = scanForDanger(command);
      expect(result.hasDanger).toBe(true);
      expect(result.level).toBe(expectedLevel);
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ message: expectedMessage }),
        ]),
      );
    },
  );

  it("should aggregate multiple warnings", () => {
    // This command contains both `sudo` and `rm`
    const command = "sudo rm important.txt";
    const result = scanForDanger(command);

    expect(result.hasDanger).toBe(true);
    // The highest danger level should be reported
    expect(result.level).toBe("medium");
    expect(result.warnings).toHaveLength(2);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "The `rm` command permanently deletes files.",
        }),
        expect.objectContaining({
          message: "`sudo` executes commands with root privileges.",
        }),
      ]),
    );
  });
});
