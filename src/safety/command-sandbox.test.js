import { executeInSandbox, getSandboxTier } from "./command-sandbox.js";

describe("command-sandbox", () => {
  describe("getSandboxTier", () => {
    it("should return a valid tier", () => {
      expect(["bwrap", "unshare", "basic"]).toContain(getSandboxTier());
    });
  });

  describe("executeInSandbox", () => {
    it("should run a simple command", () => {
      const result = executeInSandbox("echo hello");
      expect(result.success).toBe(true);
      expect(result.output).toBe("hello");
      expect(result.tier).toBeTruthy();
    });

    it("should return failure for a bad command", () => {
      const result = executeInSandbox("cat /nonexistent/path");
      expect(result.success).toBe(false);
    });

    it("should allow reading project files", () => {
      const result = executeInSandbox("cat package.json");
      expect(result.success).toBe(true);
      expect(result.output).toContain("clix");
    });

    it("should block reading /etc/shadow in bwrap", () => {
      if (getSandboxTier() !== "bwrap") return;
      const result = executeInSandbox("cat /etc/shadow");
      expect(result.success).toBe(false);
    });

    it("should block reading home dotfiles in bwrap", () => {
      if (getSandboxTier() !== "bwrap") return;
      const result = executeInSandbox("ls ~/.ssh/");
      expect(result.success).toBe(false);
    });

    it("should block network access in bwrap", () => {
      if (getSandboxTier() !== "bwrap") return;
      const result = executeInSandbox("curl -s https://example.com", {
        timeout: 5000,
      });
      expect(result.success).toBe(false);
    });

    it("should use a restricted env (HOME=/tmp)", () => {
      const result = executeInSandbox("echo $HOME");
      expect(result.success).toBe(true);
      expect(result.output).toBe("/tmp");
    });
  });
});
