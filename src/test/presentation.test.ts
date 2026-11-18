import test from "node:test";
import assert from "node:assert/strict";
import { buildDescription, buildLabel, buildTooltip, firstLine, formatDuration, isFinishedState, relativeTime, shortCommit, statusIcon } from "../presentation";

const now = new Date("2026-11-18T12:00:00Z");
const ago = (s: number) => new Date(now.getTime() - s * 1000).toISOString();

test("AC13 maps states to codicon and theme colour", () => {
  const grey = "descriptionForeground";
  assert.deepEqual(statusIcon("passed"), { icon: "check", color: "testing.iconPassed" });
  assert.deepEqual(statusIcon("failed"), { icon: "close", color: "testing.iconFailed" });
  assert.deepEqual(statusIcon("running"), { icon: "loading~spin", color: "charts.blue" });
  for (const s of ["scheduled", "creating", "waiting"]) assert.deepEqual(statusIcon(s), { icon: "clock", color: grey });
  assert.deepEqual(statusIcon("blocked"), { icon: "debug-pause", color: "charts.yellow" });
  for (const s of ["canceled", "canceling", "skipped", "not run", "not_run"]) assert.deepEqual(statusIcon(s), { icon: "circle-slash", color: grey });
  assert.deepEqual(statusIcon("whatever"), { icon: "circle-outline", color: grey });
});

test("finished states", () => {
  for (const s of ["passed", "failed", "canceled", "skipped", "not run", "not_run"]) assert.equal(isFinishedState(s), true);
  for (const s of ["running", "scheduled", "blocked", "canceling", "creating", "waiting"]) assert.equal(isFinishedState(s), false);
});

test("relative time", () => {
  assert.equal(relativeTime(ago(30), now), "now");
  assert.equal(relativeTime(ago(180), now), "3m ago");
  assert.equal(relativeTime(ago(2 * 3600 + 5), now), "2h ago");
  assert.equal(relativeTime(ago(3 * 86400), now), "3d ago");
  assert.equal(relativeTime(ago(-10), now), "now");
  assert.equal(relativeTime(undefined, now), "");
  assert.equal(relativeTime("garbage", now), "");
});

test("duration formatting", () => {
  assert.equal(formatDuration(45_000), "45s");
  assert.equal(formatDuration(250_000), "4m 10s");
  assert.equal(formatDuration(3_605_000), "1h 00m");
  assert.equal(formatDuration(3_900_000), "1h 05m");
  assert.equal(formatDuration(-5), "0s");
});

test("short commit and first line", () => {
  assert.equal(shortCommit("0123456789abcdef"), "0123456");
  assert.equal(shortCommit(undefined), "");
  assert.equal(firstLine("Fix it\nbody"), "Fix it");
  assert.equal(firstLine("\n\nFix\r\nmore"), "Fix");
  assert.equal(firstLine(undefined), "");
});

test("AC12 build label and description", () => {
  assert.equal(buildLabel({ number: 482, state: "passed", message: "Fix login\nmore" }), "#482 Fix login");
  assert.equal(buildLabel({ number: 482, state: "passed" }), "#482");
  assert.equal(buildLabel({ number: 482, state: "passed", message: "  " }), "#482");
  const b = { number: 1, state: "passed", branch: "main", commit: "abcdef123456", created_at: ago(180) };
  assert.equal(buildDescription({ ...b, started_at: ago(180) }, now), "main · 3m ago");
  assert.equal(buildDescription({ number: 1, state: "x", commit: "abcdef123456", started_at: ago(180) }, now), "abcdef1 · 3m ago");
  assert.equal(buildDescription({ number: 1, state: "x" }, now), "unknown ref");
  assert.equal(buildDescription({ number: 1, state: "x", branch: "main", started_at: ago(7200) }, now), "main · 2h ago");
  assert.equal(buildDescription({ number: 1, state: "x", branch: "main" }, now), "main");
});

test("AC14 tooltip has all fields and escapes markdown", () => {
  const t = buildTooltip({ number: 481, state: "failed", branch: "fe*at", commit: "abcdef1234567890", message: "Add [retry]\nline2", creator: { name: "Ann _B_" }, started_at: "2026-11-18T10:00:00Z", finished_at: "2026-11-18T10:05:00Z" });
  for (const s of ["#481", "failed", "fe\\*at", "abcdef1234567890", "Ann \\_B\\_", "Add \\[retry\\]", "line2", "Started", "Finished"]) assert.ok(t.includes(s), s);
  assert.ok(t.includes(new Date("2026-11-18T10:00:00Z").toLocaleString()));
  const none = buildTooltip({ number: 2, state: "running" });
  assert.ok(none.includes("Finished: —"));
});
