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

const MAX_OUTPUT_BYTES = 1024 * 1024; // 1MB
const DEFAULT_TIMEOUT = 15000;

// Paths that exist inside the bwrap sandbox (everything else doesn't exist)
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

// Tier Detection
// This should be moved to cache file cache.json in ~.clix/cache/ in the future, but for now we can just detect on each run since it's fast and we have a timeout.
let _tier = null;

function detectTier() {
  if (_tier) return _tier;

  try {
    execFileSync("bwrap", ["--version"], {
      timeout: 3000,
      stdio: ["ignore", "pipe", "pipe"],
    });
    _tier = "bwrap";
    return _tier;
  } catch {
    // not available
  }

  if (process.platform === "linux") {
    try {
      execFileSync("unshare", ["--help"], {
        timeout: 3000,
        stdio: ["ignore", "pipe", "pipe"],
      });
      _tier = "unshare";
      return _tier;
    } catch {
      // not available
    }
  }

  _tier = "basic";
  return _tier;
}

export function getSandboxTier() {
  return detectTier();
}

// Restricted Environment

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

// Execution per tier

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

// Public API

/**
 * Execute a command in the best available sandbox.
 *
 * @param {string} command - The command to run
 * @param {object} [options]
 * @param {number} [options.timeout] - Timeout in ms (default 15000)
 * @returns {{ success: boolean, output: string, tier: string }}
 */
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
