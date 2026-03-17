/**
 * Sandboxed command execution for AI-generated context commands.
 *
 * Auto-detects the best available sandbox:
 *   bwrap   → only allowlisted paths exist, read-only, no network
 *   unshare → network isolated, user namespaced
 *   basic   → restricted env, timeout, maxBuffer only
 */

import { execFileSync, execSync } from "child_process";
import fs from "fs";

const MAX_OUTPUT_BYTES = 1024 * 1024;
const DEFAULT_TIMEOUT = 15000;

const ALLOWED_PATHS = [
  "/usr",
  "/bin",
  "/sbin",
  "/lib",
  "/lib64",
  "/etc/os-release",
  "/etc/hostname",
  "/etc/resolv.conf",
  "/etc/alternatives",
  "/etc/ld.so.cache",
];

let _tier = null;

function detectTier() {
  if (_tier) return _tier;

  // try bwrap — actually run a command, not just version check
  try {
    execFileSync(
      "bwrap",
      [
        "--ro-bind",
        "/usr",
        "/usr",
        "--symlink",
        "usr/lib",
        "/lib",
        "--symlink",
        "usr/lib64",
        "/lib64",
        "--symlink",
        "usr/bin",
        "/bin",
        "--symlink",
        "usr/sbin",
        "/sbin",
        "--proc",
        "/proc",
        "--dev",
        "/dev",
        "--",
        "echo",
        "ok",
      ],
      {
        timeout: 3000,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    _tier = "bwrap";
    return _tier;
  } catch {
    // not available or not permitted
  }

  // try unshare — actually run a namespaced command
  if (process.platform === "linux") {
    try {
      execFileSync("unshare", ["-r", "-n", "--", "echo", "ok"], {
        timeout: 3000,
        stdio: ["ignore", "pipe", "pipe"],
      });
      _tier = "unshare";
      return _tier;
    } catch {
      // not available or not permitted
    }
  }

  _tier = "basic";
  return _tier;
}

export function getSandboxTier() {
  return detectTier();
}

/**
 * Reset the cached sandbox tier.
 * Exported for testing purposes only.
 */
export function _resetTierCache() {
  _tier = null;
}

function buildRestrictedEnv() {
  return {
    PATH: process.env.PATH || "/usr/bin:/bin:/usr/sbin:/sbin",
    HOME: "/tmp",
    LANG: process.env.LANG || "en_US.UTF-8",
    TERM: process.env.TERM || "xterm",
    USER: process.env.USER || "nobody",
    SHELL: "/bin/sh",
  };
}

function execBwrap(command, timeout) {
  const cwd = process.cwd();
  const args = [];

  for (const p of ALLOWED_PATHS) {
    if (fs.existsSync(p)) args.push("--ro-bind", p, p);
  }

  args.push(
    "--ro-bind",
    cwd,
    cwd,
    "--proc",
    "/proc",
    "--dev",
    "/dev",
    "--tmpfs",
    "/tmp",
    "--unshare-net",
    "--die-with-parent",
    "--chdir",
    cwd,
    "--",
    "sh",
    "-c",
    command,
  );

  return execFileSync("bwrap", args, {
    encoding: "utf-8",
    timeout,
    maxBuffer: MAX_OUTPUT_BYTES,
    stdio: ["ignore", "pipe", "pipe"],
    env: buildRestrictedEnv(),
  });
}

function execUnshare(command, timeout) {
  return execFileSync("unshare", ["-r", "-n", "--", "sh", "-c", command], {
    encoding: "utf-8",
    timeout,
    maxBuffer: MAX_OUTPUT_BYTES,
    stdio: ["ignore", "pipe", "pipe"],
    cwd: process.cwd(),
    env: buildRestrictedEnv(),
  });
}

function execBasic(command, timeout) {
  return execSync(command, {
    encoding: "utf-8",
    timeout,
    maxBuffer: MAX_OUTPUT_BYTES,
    stdio: ["ignore", "pipe", "pipe"],
    cwd: process.cwd(),
    env: buildRestrictedEnv(),
  });
}

export function executeInSandbox(command, { timeout = DEFAULT_TIMEOUT } = {}) {
  const tier = detectTier();

  try {
    let output;
    switch (tier) {
      case "bwrap":
        output = execBwrap(command, timeout);
        break;
      case "unshare":
        output = execUnshare(command, timeout);
        break;
      default:
        output = execBasic(command, timeout);
        break;
    }

    return { success: true, output: output.trim(), tier };
  } catch (e) {
    return { success: false, output: e.stderr || e.message, tier };
  }
}
