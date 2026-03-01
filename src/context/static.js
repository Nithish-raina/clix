import os from "os";

export function getOsInfo() {
  const osType = os.type(); // 'Linux', 'Darwin', 'Windows_NT'
  const osRelease = os.release(); // e.g. '5.15.0-1051-azure'
  const platform = os.platform(); // 'linux', 'darwin', 'win32'
  return { osType, osRelease, platform };
}

export function getShellInfo() {
  const shell = process.env.SHELL || process.env.COMSPEC || "unknown";
  return { shell };
}
