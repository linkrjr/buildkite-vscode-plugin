import test from "node:test";
import assert from "node:assert/strict";
import { buildPageDocument, renderBuildPage, escapeHtml, shouldPoll } from "../buildPageHtml";
import type { Build } from "../buildkite";

const now = new Date("2026-11-18T12:00:00Z");
const ago = (s: number) => new Date(now.getTime() - s * 1000).toISOString();
const build: Build = { number: 42, state: "passed", branch: "main", commit: "abcdef1234567890", message: "Fix <b>bug</b>\nsecond line", creator: { name: "Ann" }, started_at: ago(740), finished_at: ago(490), web_url: "https://buildkite.com/o/p/builds/42", jobs: [] };
const view = (b = build) => renderBuildPage({ status: "ready", pipelineName: "API", build: b }, now);

test("AC20 header shows pipeline, number, badge, branch, short commit, author, full message, times", () => {
  const html = view();
  for (const s of ["API", "#42", "Passed", "main", "abcdef1", "Ann", "second line", "Started 12m ago", "took 4m 10s", 'data-action="openBuild"', 'data-action="refresh"']) assert.ok(html.includes(s), s);
  assert.ok(!html.includes("abcdef12"));
});

test("AC20 unfinished build shows running for duration", () => {
  const html = view({ ...build, state: "running", finished_at: undefined, started_at: ago(184) });
  assert.match(html, /running for 3m 04s/);
  assert.match(html, /Running/);
});

test("AC21 lists jobs with name, duration, exit code and link; empty shows No jobs yet", () => {
  const html = view({ ...build, state: "failed", jobs: [
    { name: "Test", state: "failed", started_at: ago(100), finished_at: ago(40), exit_status: 1, web_url: "https://buildkite.com/x" },
    { name: "Lint", state: "passed", started_at: ago(30), finished_at: ago(20) }] });
  assert.match(html, /Test/); assert.match(html, /1m 00s/); assert.match(html, /exit 1/);
  assert.match(html, /data-job="0"/); assert.ok(!html.includes('data-job="1"'));
  assert.match(view(), /No jobs yet/);
});

test("AC21 unfinished job without exit code shows its state", () => {
  const html = view({ ...build, state: "running", finished_at: undefined, jobs: [{ name: "Wait", state: "waiting" }] });
  assert.match(html, /waiting/);
});

test("AC22 loading and error states; error has Retry and only the given message", () => {
  assert.match(renderBuildPage({ status: "loading" }, now), /role="status"[^>]*>[^]*Loading build…/);
  const err = renderBuildPage({ status: "error", message: "Could not reach <Buildkite>." }, now);
  assert.match(err, /Could not reach &lt;Buildkite&gt;\./); assert.match(err, /data-action="retry"/);
});

test("AC26 all dynamic text is escaped", () => {
  const html = view({ ...build, branch: '"><img src=x onerror=1>', creator: { name: "<script>x</script>" }, jobs: [{ name: "<i>", state: "passed" }] });
  assert.ok(!html.includes("<script>x")); assert.ok(!html.includes("<img")); assert.ok(!html.includes("<i>"));
  assert.equal(escapeHtml(`&<>"'`), "&amp;&lt;&gt;&quot;&#39;");
});

test("AC26 document has strict CSP, no remote loads, nonce on script and style, no URLs in fragment", () => {
  const doc = buildPageDocument("abc123", renderBuildPage({ status: "loading" }, now));
  assert.match(doc, /default-src 'none'; style-src 'nonce-abc123'; script-src 'nonce-abc123'/);
  assert.match(doc, /<script nonce="abc123">/); assert.match(doc, /<style nonce="abc123">/);
  assert.ok(!/https?:\/\//.test(doc));
  assert.ok(!view({ ...build, jobs: [{ name: "j", web_url: "https://buildkite.com/x" }] }).includes("https://"));
});

test("AC24 uses theme variables and high-contrast overrides", () => {
  const doc = buildPageDocument("n", "");
  for (const v of ["--vscode-editor-background", "--vscode-font-family", "--vscode-editor-font-family", "--vscode-focusBorder", "vscode-high-contrast"]) assert.ok(doc.includes(v), v);
});

test("AC23 polls only when visible and build unfinished", () => {
  assert.equal(shouldPoll(true, "running"), true);
  assert.equal(shouldPoll(true, "scheduled"), true);
  assert.equal(shouldPoll(true, "passed"), false);
  assert.equal(shouldPoll(true, "not_run"), false);
  assert.equal(shouldPoll(false, "running"), false);
  assert.equal(shouldPoll(true, undefined), false);
});
