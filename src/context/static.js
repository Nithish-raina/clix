/** For generating commands based on the user's query, we might need to know some static information about the user's os info and shell info. This is because different commands works in different way in different os.
 * To start with let's focus on linux, and we can add windows/macOS support later.
 */
import os from "os";
import path from "path";
import fs from "fs";
import { CACHE_DIR, CACHE_FILE, CACHE_TTL } from "../config/constants.js";

function getOsInfo() {
  const platform = process.platform;
  const arch = os.arch();
  const release = os.release();

  // full support for Linux
  if (platform === "linux") {
    let distro = "Unknown";
    try {
      const content = fs.readFileSync("/etc/os-release", "utf-8");
      const match = content.match(/PRETTY_NAME="(.+)"/);
      if (match) distro = match[1];
    } catch {
      // minimal containers might not have this file
    }
    return { platform: "Linux", distro, arch, kernel: release };
  }

  // fallback for everything else — still works, just less detailed
  return { platform, arch, kernel: release };
}

function getShellInfo() {
  const shellPath = process.env.SHELL || process.env.ComSpec || "unknown";
  const shellName = path.basename(shellPath);
  return { name: shellName, path: shellPath };
}

function getPackageManagerInfo() {
  const pathDirs = (process.env.PATH || "").split(path.delimiter);
  const managers = [];

  const checks = [
    { binary: "apt", label: "APT" },
    { binary: "yum", label: "YUM" },
    { binary: "dnf", label: "DNF" },
    { binary: "pacman", label: "Pacman" },
    { binary: "snap", label: "Snap" },
    { binary: "flatpak", label: "Flatpak" },
    { binary: "npm", label: "npm" },
    { binary: "yarn", label: "Yarn" },
    { binary: "pnpm", label: "pnpm" },
    { binary: "pip3", label: "pip3" },
    { binary: "cargo", label: "Cargo" },
    { binary: "go", label: "Go" },
    // non-linux managers included so fallback still detects them
    { binary: "brew", label: "Homebrew" },
  ];

  for (const { binary, label } of checks) {
    const found = pathDirs.some((dir) => {
      try {
        return fs.existsSync(path.join(dir, binary));
      } catch {
        return false;
      }
    });
    if (found) managers.push(label);
  }

  return managers;
}

function collectContext() {
  return {
    os: getOsInfo(),
    shell: getShellInfo(),
    packageManagers: getPackageManagerInfo(),
    collectedAt: Date.now(),
  };
}

function readCachedContext() {
  if (!fs.existsSync(CACHE_FILE)) return null;
  const content = fs.readFileSync(CACHE_FILE, "utf-8");
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    if (Date.now() - parsed.collectedAt < CACHE_TTL) {
      return parsed;
    } else {
      return null;
    }
  } catch (err) {
    // If cache is invalid or corrupted, return null
    logger.info(`Error reading context cache: ${err.message}`);
    return null;
  }
}

function writeCachedContext(ctx) {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(ctx, null, 2));
  } catch (err) {
    logger.info(`Error writing context cache: ${err.message}`);
  }
}

export function getStaticContext() {
  const cached = readCachedContext();
  if (cached) return cached;

  const context = collectContext();
  writeCachedContext(context);

  return context;
}

export function formatContextForPrompt(ctx) {
  const lines = [];

  if (ctx.os.platform === "Linux") {
    lines.push(`OS: Linux — ${ctx.os.distro} (${ctx.os.arch})`);
  } else {
    lines.push(`OS: ${ctx.os.platform} (${ctx.os.arch})`);
    lines.push(
      `Note: Full support is for Linux only. Commands may need adjustment.`,
    );
  }

  lines.push(`Shell: ${ctx.shell.name}`);
  lines.push(
    `Package managers: ${ctx.packageManagers.join(", ") || "none detected"}`,
  );

  return lines.join("\n");
}
