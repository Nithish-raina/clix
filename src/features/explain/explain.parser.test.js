import { validateCommand, parseCommandInput } from "./explain.parser.js";

describe("explain.parser", () => {
  describe("validateCommand", () => {
    it("should return valid for a reasonable command", () => {
      const result = validateCommand("ls -l");
      expect(result.valid).toBe(true);
    });

    it("should return invalid for an empty command", () => {
      const result = validateCommand("   ");
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("Command cannot be empty.");
    });

    it("should return invalid for a command that is too long", () => {
      const longCommand = "a".repeat(501);
      const result = validateCommand(longCommand);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("Command is too long");
    });
  });

  describe("parseCommandInput", () => {
    it("should parse a simple command", () => {
      const result = parseCommandInput("git status -s");
      expect(result.command).toBe("git status -s");
      expect(result.isPiped).toBe(false);
      expect(result.isMultiCommand).toBe(false);
      expect(result.hasRedirects).toBe(false);
    });

    it("should detect a piped command", () => {
      const result = parseCommandInput("ls -l | grep .js");
      expect(result.command).toBe("ls -l | grep .js");
      expect(result.isPiped).toBe(true);
      expect(result.isMultiCommand).toBe(false);
      expect(result.hasRedirects).toBe(false);
    });

    it("should detect a multi-command with &&", () => {
      const result = parseCommandInput("npm install && npm start");
      expect(result.command).toBe("npm install && npm start");
      expect(result.isPiped).toBe(false);
      expect(result.isMultiCommand).toBe(true);
      expect(result.hasRedirects).toBe(false);
    });

    it("should detect a command with redirects", () => {
      const result = parseCommandInput("node script.js > output.log");
      expect(result.command).toBe("node script.js > output.log");
      expect(result.isPiped).toBe(false);
      expect(result.isMultiCommand).toBe(false);
      expect(result.hasRedirects).toBe(true);
    });

    it("should handle a complex command with multiple operators", () => {
      const result = parseCommandInput(
        "cat file.txt | grep 'error' >> error.log && echo 'done'",
      );
      expect(result.command).toBe(
        "cat file.txt | grep 'error' >> error.log && echo 'done'",
      );
      expect(result.isPiped).toBe(true);
      expect(result.isMultiCommand).toBe(true);
      expect(result.hasRedirects).toBe(true);
    });
  });
});
