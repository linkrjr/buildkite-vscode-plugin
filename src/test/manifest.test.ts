import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const pkg = JSON.parse(readFileSync(join(__dirname, "..", "..", "package.json"), "utf8"));
const c = pkg.contributes;
const welcome = (state: string): string => c.viewsWelcome.find((w: { when: string }) => w.when === `buildkite.state == ${state}`)?.contents ?? "";
const ids: string[] = c.commands.map((x: { command: string }) => x.command);

test("AC1 disconnected welcome has connect button and token link", () => {
  const w = welcome("disconnected");
  assert.match(w, /\[Connect Buildkite\]\(command:buildkite\.connect\)/);
  assert.match(w, /\[Create an API access token\]\(command:buildkite\.openTokenPage\)/);
});
test("AC2 noOrganization welcome has select, replace and disconnect", () => {
  const w = welcome("noOrganization");
  assert.match(w, /\[Select organization\]\(command:buildkite\.changeOrganization\)/);
  assert.match(w, /\[Replace token\]\(command:buildkite\.replaceToken\)/);
  assert.match(w, /\[Disconnect\]\(command:buildkite\.disconnect\)/);
});
test("AC3 authError welcome has replace token and disconnect", () => {
  const w = welcome("authError");
  assert.match(w, /\[Replace token\]\(command:buildkite\.replaceToken\)/);
  assert.match(w, /\[Disconnect\]\(command:buildkite\.disconnect\)/);
});
test("welcome commands are all contributed", () => {
  for (const e of c.viewsWelcome) for (const m of e.contents.matchAll(/\(command:([\w.]+)\)/g)) assert.ok(ids.includes(m[1]), m[1]);
});
test("AC5 overflow menu items and folder gate", () => {
  const items = c.menus["buildkite.titleActions"];
  const cmds = items.map((i: { command: string }) => i.command);
  for (const id of ["buildkite.changeOrganization", "buildkite.changeFolder", "buildkite.replaceToken", "buildkite.disconnect"]) assert.ok(cmds.includes(id), id);
  assert.equal(items.find((i: { command: string }) => i.command === "buildkite.changeFolder").when, "buildkite.workspaceFolderCount > 1");
  for (const i of items) if (i.command !== "buildkite.changeFolder") assert.equal(i.when, undefined);
});
test("AC5 overflow submenu only shows when connected", () => {
  assert.match(c.menus["view/title"][0].when, /buildkite\.state == connected/);
});
test("openTokenPage is hidden from the command palette", () => {
  assert.ok(c.menus.commandPalette.some((m: { command: string; when: string }) => m.command === "buildkite.openTokenPage" && m.when === "false"));
});
