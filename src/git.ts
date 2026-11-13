import { execFile } from "node:child_process";
import { promisify } from "node:util";
const execFileAsync = promisify(execFile);

/** Reads only origin, never falls back to another remote. Remote text stays in memory. */
export async function originRemote(folder: string): Promise<string | undefined> {
  try {
    const { stdout } = await execFileAsync("git", ["-C", folder, "config", "--get", "remote.origin.url"], { timeout: 5000, windowsHide: true });
    return stdout.trim() || undefined;
  } catch { return undefined; }
}
