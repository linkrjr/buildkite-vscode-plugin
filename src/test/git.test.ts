import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { currentBranch } from "../git";

const git = (dir: string, ...args: string[]) => execFileSync("git", ["-C", dir, "-c", "user.name=t", "-c", "user.email=t@t", ...args], { stdio: "pipe" });
const tmp = () => mkdtempSync(join(tmpdir(), "bk-git-"));

test("AC9 currentBranch returns the checked-out branch", async () => {
  const d = tmp(); git(d, "init", "-q", "-b", "feature/x");
  assert.equal(await currentBranch(d), "feature/x");
});
test("AC9 currentBranch is undefined on a detached HEAD", async () => {
  const d = tmp(); git(d, "init", "-q", "-b", "main"); git(d, "commit", "-q", "--allow-empty", "-m", "c"); git(d, "checkout", "-q", "--detach");
  assert.equal(await currentBranch(d), undefined);
});
test("AC9 currentBranch is undefined outside a repository", async () => {
  assert.equal(await currentBranch(tmp()), undefined);
});
