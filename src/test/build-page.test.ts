import test from "node:test";
import assert from "node:assert/strict";
import Module from "node:module";

// Hand-written vscode mock (the real module only exists inside VS Code).
class FakePanel {
  title: string; visible = true; revealed = 0; disposed = false; iconPath: unknown;
  messages: { html: string }[] = [];
  private msgH: ((m: unknown) => void)[] = []; private viewH: (() => void)[] = []; private disposeH: (() => void)[] = [];
  webview = { html: "", onDidReceiveMessage: (h: (m: unknown) => void) => { this.msgH.push(h); }, postMessage: async (m: { html: string }) => { this.messages.push(m); return true; } };
  constructor(title: string) { this.title = title; }
  reveal() { this.revealed++; }
  onDidChangeViewState(h: () => void) { this.viewH.push(h); }
  onDidDispose(h: () => void) { this.disposeH.push(h); }
  dispose() { this.disposed = true; this.disposeH.forEach((h) => h()); }
  setVisible(v: boolean) { this.visible = v; this.viewH.forEach((h) => h()); }
  send(m: unknown) { this.msgH.forEach((h) => h(m)); }
  get last() { return this.messages[this.messages.length - 1]?.html ?? ""; }
}
const panels: FakePanel[] = [];
const vscodeMock = {
  ViewColumn: { Active: -1 },
  Uri: { joinPath: (_b: unknown, ...p: string[]) => p.join("/") },
  window: { createWebviewPanel: (_t: string, title: string) => { const p = new FakePanel(title); panels.push(p); return p; } },
};
const M = Module as unknown as { _load: (...a: unknown[]) => unknown };
const origLoad = M._load;
M._load = function (request: unknown, ...rest: unknown[]) { return request === "vscode" ? vscodeMock : origLoad.call(this, request, ...rest); };
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { BuildPage } = require("../buildPage") as typeof import("../buildPage");
import { BuildkiteError } from "../buildkite";
import type { Build } from "../buildkite";

const running: Build = { number: 7, state: "running", branch: "main", commit: "abcdef1234", started_at: new Date().toISOString(), jobs: [] };
const passed: Build = { ...running, state: "passed", finished_at: new Date().toISOString() };
const target = (name: string, n: number) => ({ pipeline: { slug: name.toLowerCase(), name }, number: n });
const flush = async () => { for (let i = 0; i < 5; i++) await Promise.resolve(); };

function setup(fetch: (org: string, slug: string, n: number) => Promise<Build>) {
  panels.length = 0;
  const page = new BuildPage({} as never, fetch, () => undefined);
  return page;
}

test("AC19 one reused panel is retitled for the next build", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const page = setup(async () => passed);
  page.show(target("App", 7), "org");
  page.show(target("Api", 9), "org");
  await flush();
  assert.equal(panels.length, 1);
  assert.equal(panels[0].title, "Api #9");
  assert.equal(panels[0].revealed, 1);
  page.dispose();
});

test("AC23 polls every 10s while visible and unfinished; stops when hidden or finished; resumes on show", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const calls: number[] = []; let state: Build = running;
  const page = setup(async (_o, _s, n) => { calls.push(n); return state; });
  page.show(target("App", 7), "org"); await flush();
  assert.equal(calls.length, 1);
  t.mock.timers.tick(10_000); await flush();
  assert.equal(calls.length, 2);
  panels[0].setVisible(false);
  t.mock.timers.tick(30_000); await flush();
  assert.equal(calls.length, 2, "no polling while hidden");
  panels[0].setVisible(true); await flush();
  assert.equal(calls.length, 3, "refetches on show");
  state = passed;
  t.mock.timers.tick(10_000); await flush();
  assert.equal(calls.length, 4);
  t.mock.timers.tick(60_000); await flush();
  assert.equal(calls.length, 4, "stops once finished");
  page.dispose();
});

test("AC25 syncOrganization closes the page when the organization changes or is lost, keeps it when unchanged", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const page = setup(async () => running);
  page.show(target("App", 7), "org"); await flush();
  page.syncOrganization("org");
  assert.equal(panels[0].disposed, false);
  page.syncOrganization("other");
  assert.equal(panels[0].disposed, true);
  page.show(target("App", 7), "org"); await flush();
  assert.equal(panels.length, 2);
  page.syncOrganization(undefined);
  assert.equal(panels[1].disposed, true);
});

test("fetches use the organization captured in show()", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const orgs: string[] = [];
  const page = setup(async (o) => { orgs.push(o); return running; });
  page.show(target("App", 7), "first"); await flush();
  t.mock.timers.tick(10_000); await flush();
  assert.deepEqual(orgs, ["first", "first"]);
  page.dispose();
});

test("a failed background poll keeps the build and shows a notice; polling continues; initial failure shows error", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let fail = false; let calls = 0;
  const page = setup(async () => { calls++; if (fail) throw new BuildkiteError("network"); return running; });
  page.show(target("App", 7), "org"); await flush();
  fail = true;
  t.mock.timers.tick(10_000); await flush();
  assert.match(panels[0].last, /Couldn't refresh — retrying/);
  assert.match(panels[0].last, /#7/);
  assert.ok(!panels[0].last.includes("Could not load build"));
  t.mock.timers.tick(10_000); await flush();
  assert.equal(calls, 3, "keeps polling");
  fail = false;
  t.mock.timers.tick(10_000); await flush();
  assert.ok(!panels[0].last.includes("Couldn't refresh"));
  page.dispose();

  const page2 = setup(async () => { throw new BuildkiteError("network"); });
  page2.show(target("App", 7), "org"); await flush();
  assert.match(panels[0].last, /Could not load build/);
  assert.match(panels[0].last, /data-action="retry"/);
  page2.dispose();
});

test("loading is posted once on show and the webview ready handshake resends the current state", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const page = setup(async () => passed);
  page.show(target("App", 7), "org");
  assert.equal(panels[0].messages.filter((m) => m.html.includes("Loading build")).length, 1);
  await flush();
  const before = panels[0].messages.length;
  panels[0].send({ type: "ready" });
  assert.equal(panels[0].messages.length, before + 1);
  assert.match(panels[0].last, /Passed/);
  page.dispose();
});
