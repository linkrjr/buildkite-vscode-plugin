import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Module = require("node:module");

// Minimal hand-written `vscode` mock: just enough for the provider to run.
class TreeItem { description?: string; contextValue?: string; id?: string; command?: unknown; iconPath?: unknown; tooltip?: unknown; constructor(public label: string, public collapsibleState?: number) {} }
class ThemeIcon { constructor(public id: string, public color?: unknown) {} }
class ThemeColor { constructor(public id: string) {} }
class MarkdownString { constructor(public value: string) {} }
class EventEmitter<T> { private ls: ((e: T) => void)[] = []; event = (l: (e: T) => void) => { this.ls.push(l); return { dispose() {} }; }; fire(e: T) { this.ls.forEach(l => l(e)); } dispose() {} }

const repo = mkdtempSync(join(tmpdir(), "bk-"));
execFileSync("git", ["-C", repo, "init", "-q"]);
execFileSync("git", ["-C", repo, "remote", "add", "origin", "git@github.com:acme/app.git"]);

const secrets = new Map<string, string>();
let provider: any; let fires = 0; const progress: any[] = [];
const vscodeMock: any = {
  TreeItem, ThemeIcon, ThemeColor, MarkdownString, EventEmitter,
  TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
  Uri: { parse: (s: string) => ({ toString: () => s }) },
  workspace: { workspaceFolders: [{ name: "app", uri: { fsPath: repo } }] },
  commands: { executeCommand: async () => undefined, registerCommand: () => ({ dispose() {} }) },
  env: { openExternal: async () => true },
  window: {
    withProgress: async (o: any, task: () => Promise<unknown>) => { progress.push(o); return task(); },
    showInputBox: async () => "tok", showQuickPick: async (items: any[]) => items[0],
    showInformationMessage() {}, showErrorMessage() {}, showWarningMessage() {},
    createTreeView: (_id: string, o: any) => { provider = o.treeDataProvider; return { visible: false, onDidChangeVisibility: () => ({ dispose() {} }), dispose() {} }; }
  }
};
const origLoad = Module._load;
Module._load = function (request: string, ...rest: unknown[]) { return request === "vscode" ? vscodeMock : origLoad.call(this, request, ...rest); };

const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
const build = (n: number, state = "passed") => ({ number: n, state, branch: "main", message: `m${n}`, commit: "abcdef1234" });
const pipelines = [{ slug: "app", name: "App", repository: "https://github.com/acme/app.git" }, ...Array.from({ length: 59 }, (_, i) => ({ slug: `p${i}`, name: `P${String(i).padStart(2, "0")}`, repository: `https://github.com/x/p${i}` }))];
globalThis.fetch = (async (url: string) => {
  if (url.includes("/builds")) return json(Array.from({ length: 30 }, (_, i) => build(i + 1, "failed")));
  if (url.includes("/pipelines")) return json(url.includes("page=1") ? pipelines : []);
  return json([{ slug: "acme", name: "Acme" }]);
}) as typeof fetch;

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ext = require("../extension");
const ctx = { secrets: { get: async (k: string) => secrets.get(k), store: async (k: string, v: string) => { secrets.set(k, v); }, delete: async (k: string) => { secrets.delete(k); } }, subscriptions: [] as any[] };
const setup = (async () => {
  ext.activate(ctx);
  await provider.connect();
  provider.onDidChangeTreeData(() => { fires++; });
})();

test("AC6 Current project section is expanded, shows pipeline name, has contextValue and caps builds at 20", async () => {
  await setup;
  const [section] = await provider.getChildren();
  assert.equal(section.label, "Current project");
  assert.equal(section.collapsibleState, 2);
  assert.equal(section.description, "App");
  assert.equal(section.contextValue, "currentProject");
  const rows = await provider.getChildren(section);
  assert.equal(rows.length, 20);
});

test("AC7/AC10 My Pipelines count uses the unfiltered total and the current pipeline is starred", async () => {
  await setup;
  provider.state.search = "P01";
  const nodes = await provider.getChildren();
  assert.equal(nodes[1].label, "My Pipelines (60)");
  const rows = await provider.getChildren(nodes[1]);
  assert.deepEqual(rows.map((r: any) => r.label), ["P01"]);
  provider.state.search = "";
  const all = await provider.getChildren(nodes[1]);
  assert.equal(all[0].label, "App ★");
  assert.equal(all.at(-1).label, "Load more");
});

test("AC6 no-match section shows muted row with tooltip", async () => {
  await setup;
  provider.state.current = undefined;
  provider.state.pipelines = [];
  const [section] = await provider.getChildren();
  assert.equal(section.contextValue, "currentProjectNoMatch");
  const [row] = await provider.getChildren(section);
  assert.equal(row.label, "No pipeline uses this repository");
  assert.ok(row.tooltip);
  assert.equal((row.iconPath as ThemeIcon).id, "info");
  await provider.refresh();
});

test("AC16 loading a pipeline's builds fires a tree change so its icon updates", async () => {
  await setup;
  const nodes = await provider.getChildren();
  const rows = await provider.getChildren(nodes[1]);
  const p0 = rows.find((r: any) => r.label === "P00");
  assert.equal((p0.iconPath as ThemeIcon).id, "package");
  const before = fires;
  await provider.getChildren(p0);
  assert.ok(fires > before);
  const after = (await provider.getChildren(nodes[1])).find((r: any) => r.label === "P00");
  assert.notEqual((after.iconPath as ThemeIcon).id, "package");
});

test("AC8 Refresh is inline on Current project and My Pipelines section rows", () => {
  const menus = JSON.parse(readFileSync(join(__dirname, "..", "..", "package.json"), "utf8")).contributes.menus["view/item/context"];
  const refresh = menus.filter((m: any) => m.command === "buildkite.refresh");
  assert.ok(refresh.some((m: any) => /currentProject/.test(m.when) && /currentProjectNoMatch/.test(m.when) && m.group === "inline"));
  assert.ok(refresh.some((m: any) => /myPipelines/.test(m.when) && m.group === "inline"));
});

test("a stale render awaiting git does not overwrite a match committed by a concurrent refresh", async () => {
  await setup;
  await provider.refresh();
  const fresh = provider.state.current;
  assert.equal(fresh.kind, "match");
  const stalePipelines = provider.state.pipelines;
  provider.state.current = undefined;
  provider.state.pipelines = [];
  const stale = provider.currentMatch(); // reads [] then awaits git
  provider.state.pipelines = stalePipelines;
  provider.state.current = fresh; // refresh finishes meanwhile
  await stale;
  assert.equal(provider.state.current, fresh);
});

test("disconnect drops the cached current match", async () => {
  await setup;
  await provider.refresh();
  assert.ok(provider.state.current);
  await provider.disconnect();
  assert.equal(provider.state.current, undefined);
  await provider.connect();
});

test("changing organization drops the cached current match until refresh recomputes it", async () => {
  await setup;
  await provider.refresh();
  assert.equal(provider.state.current.kind, "match");
  const seen: unknown[] = [];
  const orig = provider.refresh.bind(provider);
  provider.refresh = async () => { seen.push(provider.state.current); await orig(); };
  await provider.chooseOrganization();
  provider.refresh = orig;
  assert.deepEqual(seen, [undefined]);
  assert.equal(provider.state.current.kind, "match");
});

test("AC11 filter shows query with matches of total, Clear filter restores the list", async () => {
  await setup;
  provider.state.search = "P01";
  const nodes = await provider.getChildren();
  assert.equal(nodes[1].description, "“P01” · 1 of 60");
  assert.equal(nodes[1].contextValue, "myPipelinesFiltered");
  provider.clearFilter();
  const cleared = await provider.getChildren();
  assert.equal(cleared[1].description, undefined);
  assert.equal(cleared[1].contextValue, "myPipelines");
  assert.equal((await provider.getChildren(cleared[1])).length, 51);
});

test("AC11 no matches shows a muted row; menus swap Search for Clear filter", async () => {
  await setup;
  provider.state.search = "zzz";
  const nodes = await provider.getChildren();
  const [row] = await provider.getChildren(nodes[1]);
  assert.equal(row.label, "No pipelines match “zzz”");
  provider.clearFilter();
  const menus = JSON.parse(readFileSync(join(__dirname, "..", "..", "package.json"), "utf8")).contributes.menus["view/item/context"];
  assert.ok(menus.some((m: any) => m.command === "buildkite.searchPipelines" && m.when.endsWith("viewItem == myPipelines")));
  assert.ok(menus.some((m: any) => m.command === "buildkite.clearFilter" && m.when.endsWith("viewItem == myPipelinesFiltered")));
});

test("AC17 refresh runs inside the view progress and keeps loaded rows", async () => {
  await setup;
  progress.length = 0;
  let during: any[] = [];
  const unsub = provider.onDidChangeTreeData(async () => { if (provider.state.loading) during = await provider.getChildren(); });
  await provider.refresh();
  assert.deepEqual(progress[0].location, { viewId: "buildkite.explorer" });
  assert.equal(during[0].label, "Current project");
  assert.ok(during.every((n: any) => n.label !== "Refreshing Buildkite data…"));
});

test("AC18 failed refresh shows one red error row with Retry that clears after success", async () => {
  await setup;
  const orig = globalThis.fetch;
  globalThis.fetch = (async () => new Response("{}", { status: 500 })) as typeof fetch;
  await provider.refresh();
  globalThis.fetch = orig;
  let nodes = await provider.getChildren();
  assert.equal(nodes.filter((n: any) => n.contextValue === "errorRow").length, 1);
  assert.equal(nodes[0].contextValue, "errorRow");
  assert.equal((nodes[0].iconPath as ThemeIcon).id, "error");
  assert.equal((nodes[0].iconPath as any).color.id, "errorForeground");
  const menus = JSON.parse(readFileSync(join(__dirname, "..", "..", "package.json"), "utf8")).contributes.menus["view/item/context"];
  assert.ok(menus.some((m: any) => m.command === "buildkite.retry" && /errorRow/.test(m.when) && m.group === "inline"));
  await provider.refresh();
  nodes = await provider.getChildren();
  assert.ok(nodes.every((n: any) => n.contextValue !== "errorRow"));
});

test("AC18 a failed builds load surfaces through the error row, not 'No recent builds'", async () => {
  await setup;
  await provider.refresh();
  provider.state.pipelineBuilds.clear();
  const orig = globalThis.fetch;
  globalThis.fetch = (async () => new Response("{}", { status: 500 })) as typeof fetch;
  const nodes = await provider.getChildren();
  const rows = await provider.getChildren(nodes.find((n: any) => n.label.startsWith("My Pipelines")));
  const before = fires;
  const children = await provider.getChildren(rows[0]);
  globalThis.fetch = orig;
  assert.deepEqual(children, []);
  assert.ok(fires > before);
  assert.equal((await provider.getChildren())[0].contextValue, "errorRow");
  await provider.refresh();
});
