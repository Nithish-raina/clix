import fs from "fs";
import path from "path";

const INSTALL_SUGGESTIONS = {
  apt: {
    rg: "sudo apt install ripgrep",
    fd: "sudo apt install fd-find",
    jq: "sudo apt install jq",
    fzf: "sudo apt install fzf",
    bat: "sudo apt install bat",
    tree: "sudo apt install tree",
    wget: "sudo apt install wget",
    htop: "sudo apt install htop",
    curl: "sudo apt install curl",
    git: "sudo apt install git",
    docker: "sudo apt install docker.io",
    ffmpeg: "sudo apt install ffmpeg",
    rsync: "sudo apt install rsync",
    zip: "sudo apt install zip",
    unzip: "sudo apt install unzip",
  },
  dnf: {
    rg: "sudo dnf install ripgrep",
    fd: "sudo dnf install fd-find",
    jq: "sudo dnf install jq",
    tree: "sudo dnf install tree",
    git: "sudo dnf install git",
    docker: "sudo dnf install docker",
  },
  pacman: {
    rg: "sudo pacman -S ripgrep",
    fd: "sudo pacman -S fd",
    jq: "sudo pacman -S jq",
    tree: "sudo pacman -S tree",
    git: "sudo pacman -S git",
    docker: "sudo pacman -S docker",
  },
};

function toolExistsOnPath(toolName) {
  const pathDirs = (process.env.PATH || "").split(path.delimiter);

  return pathDirs.some((dir) => {
    try {
      return fs.existsSync(path.join(dir, toolName));
    } catch {
      return false;
    }
  });
}

function getInstallSuggestions(toolName, packageManagers) {
  const suggestions = [];

  for (const pm of packageManagers) {
    const pmKey = pm.toLowerCase();
    if (INSTALL_SUGGESTIONS[pmKey]?.[toolName]) {
      suggestions.push(INSTALL_SUGGESTIONS[pmKey][toolName]);
    }
  }

  return suggestions;
}

/**
 * Verify a list of tools are installed on the system.
 *
 * @param {string[]} tools - List of tool/binary names to check
 * @param {string[]} packageManagers - Available package managers
 * @returns {{ found: string[], missing: { tool: string, installSuggestions: string[] }[], allAvailable: boolean }}
 */
export function verifyTools(tools, packageManagers) {
  const found = [];
  const missing = [];

  for (const tool of tools) {
    if (toolExistsOnPath(tool)) {
      found.push(tool);
    } else {
      missing.push({
        tool,
        installSuggestions: getInstallSuggestions(tool, packageManagers),
      });
    }
  }

  return {
    found,
    missing,
    allAvailable: missing.length === 0,
  };
}
