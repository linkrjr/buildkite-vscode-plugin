import * as vscode from "vscode";
import { BuildkiteClient, BuildkiteError, Build, Job, Organization, Pipeline, pipelineRepository } from "./buildkite";
import { currentBranch, originRemote } from "./git";
import { buildDescription, buildLabel, buildTooltip, statusIcon } from "./presentation";
import { currentProject, myPipelinesLabel, pipelineIcon, pipelineLabel, type CurrentProject } from "./tree";
import { TOKEN_PAGE_URL, isAuthFailure, viewState, viewSubtitle } from "./viewstate";
import { BuildPage, BuildPageTarget } from "./buildPage";

const TOKEN_KEY = "buildkite.userToken";
type NodeKind = "info" | "action" | "currentProject" | "pipelines" | "pipeline" | "build" | "job";
interface BuildTarget { pipeline: Pipeline; build: Build; }
class Node extends vscode.TreeItem {
  constructor(label: string, readonly kind: NodeKind, readonly data?: unknown, collapsible = vscode.TreeItemCollapsibleState.None, description?: string, contextValue?: string, id?: string) {
    super(label, collapsible); this.description = description;
    this.contextValue = contextValue;
    this.id = id;
    if (kind === "action") this.command = { command: data as string, title: label };
    if (kind === "build") this.command = { command: "buildkite.expandBuild", title: "Show build details", arguments: [data] };
  }
}
interface State { org?: Organization; folders: readonly vscode.WorkspaceFolder[]; folder?: vscode.WorkspaceFolder; pipelines: Pipeline[]; shown: number; search: string; current?: CurrentProject; pipelineBuilds: Map<string, Build[]>; buildDetails: Map<string, Build>; error?: string; authError: boolean; loading: boolean; }
function emptyState(): State { const folders = vscode.workspace.workspaceFolders ?? []; return { folders, folder: folders[0], pipelines: [], shown: 50, search: "", pipelineBuilds: new Map(), buildDetails: new Map(), authError: false, loading: false }; }

function safePipeline(p: Pipeline): Pipeline { return { slug: p.slug, name: p.name, repository: pipelineRepository(p), web_url: p.web_url }; }
function safeJob(j: Job): Job { return { name: j.name, type: j.type, state: j.state, started_at: j.started_at, finished_at: j.finished_at, exit_status: j.exit_status, web_url: j.web_url }; }
function safeBuild(b: Build): Build { return { number: b.number, state: b.state, branch: b.branch, commit: b.commit, message: b.message, creator: b.creator ? { name: b.creator.name } : undefined, started_at: b.started_at, finished_at: b.finished_at, web_url: b.web_url, jobs: b.jobs?.map(safeJob) }; }
function duration(job: Job): string | undefined { if (!job.started_at || !job.finished_at) return undefined; const ms = Date.parse(job.finished_at) - Date.parse(job.started_at); return Number.isFinite(ms) ? `${Math.max(0, Math.round(ms / 1000))}s` : undefined; }
const themeIcon = (i: { icon: string; color?: string }): vscode.ThemeIcon => new vscode.ThemeIcon(i.icon, i.color ? new vscode.ThemeColor(i.color) : undefined);

class BuildkiteProvider implements vscode.TreeDataProvider<Node>, vscode.Disposable {
  private readonly changed = new vscode.EventEmitter<Node | undefined>(); readonly onDidChangeTreeData = this.changed.event;
  private refreshTimer?: NodeJS.Timeout; private visible = false;
  private state: State = emptyState();
  constructor(private readonly secrets: vscode.SecretStorage) {}
  dispose(): void { if (this.refreshTimer) clearInterval(this.refreshTimer); this.changed.dispose(); }
  view?: vscode.TreeView<Node>;
  private async updateContext(hasToken: boolean): Promise<void> {
    const state = viewState({ hasToken, hasOrg: Boolean(this.state.org), authError: this.state.authError });
    await vscode.commands.executeCommand("setContext", "buildkite.state", state);
    await vscode.commands.executeCommand("setContext", "buildkite.workspaceFolderCount", (vscode.workspace.workspaceFolders ?? []).length);
    if (this.view) this.view.description = state === "connected" && this.state.org ? viewSubtitle(this.state.org.name, this.state.folder?.name) : undefined;
  }
  private fail(e: unknown): void { this.state.error = this.message(e); if (isAuthFailure(e)) { this.state.org = undefined; this.state.authError = true; } }
  setVisible(visible: boolean): void { this.visible = visible; if (visible && !this.refreshTimer) this.refreshTimer = setInterval(() => { void this.refresh(); }, 60_000); if (!visible && this.refreshTimer) { clearInterval(this.refreshTimer); this.refreshTimer = undefined; } if (visible) void this.refresh(); }
  async getChildren(element?: Node): Promise<Node[]> {
    if (!element) return this.root();
    if (element.kind === "currentProject") return this.currentProjectNodes(element.data as CurrentProject);
    if (element.kind === "pipelines") return this.pipelineNodes();
    if (element.kind === "pipeline") return this.pipelineChildren(element.data as Pipeline);
    if (element.kind === "build") return this.buildChildren(element.data as BuildTarget);
    return [];
  }
  getTreeItem(e: Node): vscode.TreeItem { return e; }
  private async root(): Promise<Node[]> {
    const token = await this.secrets.get(TOKEN_KEY);
    await this.updateContext(Boolean(token));
    if (!token || !this.state.org) return [];
    const nodes: Node[] = [];
    if (this.state.error) { const n = new Node(this.state.error, "info", undefined, vscode.TreeItemCollapsibleState.None, undefined, "errorRow", "error-row"); n.iconPath = new vscode.ThemeIcon("error", new vscode.ThemeColor("errorForeground")); nodes.push(n); }
    const current = await this.currentMatch();
    const section = new Node("Current project", "currentProject", current, vscode.TreeItemCollapsibleState.Expanded, current.kind === "match" ? current.pipeline.name : undefined, current.kind === "match" ? "currentProject" : "currentProjectNoMatch", "current-project");
    const mine = new Node(myPipelinesLabel(this.state.pipelines.length), "pipelines", undefined, vscode.TreeItemCollapsibleState.Expanded, this.state.search ? `“${this.state.search}” · ${this.filteredPipelines().length} of ${this.state.pipelines.length}` : undefined, this.state.search ? "myPipelinesFiltered" : "myPipelines", "my-pipelines");
    nodes.push(section, mine);
    return nodes;
  }
  private muted(label: string, tooltip?: string): Node {
    const n = new Node(label, "info"); n.iconPath = new vscode.ThemeIcon("info", new vscode.ThemeColor("descriptionForeground")); if (tooltip) n.tooltip = tooltip; return n;
  }
  private async currentProjectNodes(current: CurrentProject): Promise<Node[]> {
    if (current.kind === "none") return [this.muted(current.text, current.tooltip)];
    return this.pipelineChildren(current.pipeline, "current");
  }
  private async pipelineNodes(): Promise<Node[]> {
    const current = await this.currentMatch();
    const currentSlug = current.kind === "match" ? current.pipeline.slug : undefined;
    const filtered = this.filteredPipelines();
    const nodes = filtered.slice(0, this.state.shown).map(p => {
      const n = new Node(pipelineLabel(p.name, p.slug === currentSlug), "pipeline", p, vscode.TreeItemCollapsibleState.Collapsed, p.slug, "pipeline", `pipeline:${p.slug}`);
      n.iconPath = themeIcon(pipelineIcon(this.state.pipelineBuilds.get(p.slug)));
      return n;
    });
    if (!nodes.length) nodes.push(this.muted(this.state.search ? `No pipelines match “${this.state.search}”` : "No accessible pipelines"));
    if (filtered.length > this.state.shown) { const n = new Node("Load more", "action", "buildkite.loadMore"); n.iconPath = new vscode.ThemeIcon("ellipsis"); nodes.push(n); }
    return nodes;
  }
  private async pipelineChildren(pipeline: Pipeline, scope = "pipeline"): Promise<Node[]> {
    const builds = this.state.pipelineBuilds.get(pipeline.slug) ?? await this.loadPipelineBuilds(pipeline);
    if (!builds) return [];
    if (!builds.length) return [this.muted("No recent builds")];
    const now = new Date();
    return builds.map(build => {
      const n = new Node(buildLabel(build), "build", { pipeline, build } satisfies BuildTarget, vscode.TreeItemCollapsibleState.Collapsed, buildDescription(build, now), "build", `build:${scope}:${pipeline.slug}:${build.number}`);
      n.iconPath = themeIcon(statusIcon(build.state));
      n.tooltip = new vscode.MarkdownString(buildTooltip(build));
      return n;
    });
  }
  private async loadPipelineBuilds(pipeline: Pipeline): Promise<Build[] | undefined> {
    const client = await this.client();
    if (!client || !this.state.org) return [];
    try {
      const builds = (await client.builds(this.state.org.slug, pipeline.slug)).slice(0, 20).map(safeBuild);
      this.state.pipelineBuilds.set(pipeline.slug, builds);
      this.changed.fire(undefined);
      return builds;
    } catch (e) {
      // Surface through the error row; only re-render when it changes, otherwise the failed load would retrigger itself.
      const before = this.state.error;
      this.fail(e);
      if (this.state.error !== before) this.changed.fire(undefined);
      return undefined;
    }
  }
  private async buildChildren(target: BuildTarget): Promise<Node[]> {
    const detail = this.state.buildDetails.get(this.buildKey(target)) ?? target.build;
    const output = [new Node(`Status: ${detail.state}`, "info"), new Node(`Author: ${detail.creator?.name ?? "Unknown"}`, "info"), new Node(`Message: ${detail.message ?? "—"}`, "info"), new Node(`Started: ${detail.started_at ?? "—"}`, "info"), new Node(`Finished: ${detail.finished_at ?? "—"}`, "info")];
    if (detail.web_url) { const n = new Node("Open in Buildkite", "action"); n.command = { command: "buildkite.openBuild", title: "Open in Buildkite", arguments: [detail.web_url] }; output.push(n); }
    output.push(...(detail.jobs ?? []).map(j => new Node(j.name ?? j.type ?? "Job", "job", undefined, vscode.TreeItemCollapsibleState.None, [j.state, duration(j), j.exit_status === undefined ? undefined : `exit ${j.exit_status}`].filter(Boolean).join(" · "))));
    if (!detail.jobs?.length) output.push(new Node("No jobs available", "info"));
    return output;
  }
  private filteredPipelines(): Pipeline[] { const q = this.state.search.toLowerCase(); return this.state.pipelines.filter(p => !q || `${p.name} ${p.slug}`.toLowerCase().includes(q)); }
  private async client(): Promise<BuildkiteClient | undefined> { const token = await this.secrets.get(TOKEN_KEY); return token ? new BuildkiteClient(token) : undefined; }
  async connect(): Promise<void> {
    const token = await vscode.window.showInputBox({ prompt: "Buildkite user token", password: true, ignoreFocusOut: true });
    if (!token) return;
    try { const client = new BuildkiteClient(token); const orgs = await client.organizations(); if (!orgs.length) throw new BuildkiteError("authorization"); await this.secrets.store(TOKEN_KEY, token); await this.chooseOrganization(orgs); vscode.window.showInformationMessage("Buildkite connected."); }
    catch (e) { vscode.window.showErrorMessage(this.message(e)); }
  }
  async replaceToken(): Promise<void> { await this.connect(); }
  async disconnect(): Promise<void> { await this.secrets.delete(TOKEN_KEY); this.clear(); vscode.window.showInformationMessage("Buildkite disconnected."); }
  private clear(): void { this.state = emptyState(); this.changed.fire(undefined); }
  async chooseOrganization(existing?: Organization[]): Promise<void> {
    const client = await this.client(); if (!client) return;
    try { const orgs = existing ?? await client.organizations(); const choice = await vscode.window.showQuickPick(orgs.map(o => ({ label: o.name, description: o.slug, org: o })), { placeHolder: "Select an authorized Buildkite organization" }); if (!choice) return; this.state.org = choice.org; this.state.authError = false; this.state.error = undefined; this.state.pipelines = []; this.state.current = undefined; this.state.pipelineBuilds.clear(); this.state.buildDetails.clear(); this.state.shown = 50; this.state.search = ""; await this.refresh(); }
    catch (e) { this.fail(e); this.changed.fire(undefined); }
  }
  async chooseFolder(): Promise<void> { const folders = vscode.workspace.workspaceFolders ?? []; const choice = await vscode.window.showQuickPick(folders.map(f => ({ label: f.name, description: f.uri.fsPath, folder: f })), { placeHolder: "Choose workspace folder for current project" }); if (choice) { this.state.folder = choice.folder; this.state.current = undefined; await this.refresh(); } }
  async search(): Promise<void> { const q = await vscode.window.showInputBox({ prompt: "Search authorized pipelines", value: this.state.search }); if (q !== undefined) { this.state.search = q.trim(); this.state.shown = 50; this.changed.fire(undefined); } }
  clearFilter(): void { this.state.search = ""; this.state.shown = 50; this.changed.fire(undefined); }
  loadMore(): void { this.state.shown += 50; this.changed.fire(undefined); }
  async refresh(): Promise<void> {
    if (!this.visible && !this.state.org) return; const client = await this.client(); if (!client || !this.state.org) return;
    await vscode.window.withProgress({ location: { viewId: "buildkite.explorer" } }, () => this.load(client));
  }
  private async load(client: BuildkiteClient): Promise<void> {
    if (!this.state.org) return;
    this.state.loading = true; this.state.error = undefined; this.changed.fire(undefined);
    try {
      const all: Pipeline[] = []; for (let page = 1; ; page++) { const part = await client.pipelines(this.state.org.slug, page); all.push(...part.map(safePipeline)); if (part.length < 100) break; }
      const pipelines = all.sort((a, b) => a.name.localeCompare(b.name));
      const oldBuilds = this.state.pipelineBuilds;
      const refreshedBuilds = new Map<string, Build[]>();
      await Promise.all([...oldBuilds.entries()].map(async ([slug, previous]) => {
        const pipeline = pipelines.find(candidate => candidate.slug === slug);
        if (!pipeline) return;
        try { refreshedBuilds.set(slug, (await client.builds(this.state.org!.slug, pipeline.slug)).slice(0, 20).map(safeBuild)); }
        catch { refreshedBuilds.set(slug, previous); }
      }));
      this.state.pipelines = pipelines;
      this.state.current = undefined;
      this.state.current = await this.currentMatch();
      this.state.pipelineBuilds = refreshedBuilds;
      this.state.buildDetails.clear();
    } catch (e) { this.fail(e); }
    finally { this.state.loading = false; this.changed.fire(undefined); }
  }
  /** Cached per refresh/folder change; computed lazily before the first refresh. */
  private async currentMatch(): Promise<CurrentProject> {
    if (this.state.current) return this.state.current;
    const { pipelines, folder } = this.state;
    const computed = currentProject(folder ? await originRemote(folder.uri.fsPath) : undefined, pipelines);
    // Commit only if nothing replaced the inputs while git was running; otherwise a stale result must not overwrite a fresher one.
    if (!this.state.current && this.state.pipelines === pipelines && this.state.folder === folder) this.state.current = computed;
    return this.state.current ?? computed;
  }
  private buildKey(target: BuildTarget): string { return `${target.pipeline.slug}:${target.build.number}`; }
  async expandBuild(target: BuildTarget): Promise<void> { const client = await this.client(); if (!client || !this.state.org) return; try { this.state.buildDetails.set(this.buildKey(target), safeBuild(await client.build(this.state.org.slug, target.pipeline.slug, target.build.number))); this.changed.fire(undefined); } catch (e) { vscode.window.showErrorMessage(this.message(e)); } }
  get organizationSlug(): string | undefined { return this.state.org?.slug; }
  async fetchBuild(organizationSlug: string, pipelineSlug: string, number: number): Promise<Build> { const client = await this.client(); if (!client) throw new BuildkiteError("authentication"); return safeBuild(await client.build(organizationSlug, pipelineSlug, number)); }
  /** Quick trigger from Current project: preset pipeline, branch pre-filled from the folder's Git branch (empty if detached/unknown). */
  async triggerCurrent(): Promise<void> {
    const current = await this.currentMatch();
    if (current.kind !== "match") { vscode.window.showWarningMessage("No Buildkite pipeline matches this project."); return; }
    const folder = this.state.folder;
    await this.trigger({ pipeline: current.pipeline, branch: (folder ? await currentBranch(folder.uri.fsPath) : undefined) ?? "" });
  }
  async trigger(preset?: { pipeline: Pipeline; branch: string }): Promise<void> {
    const pipelines = this.state.pipelines; if (!this.state.org || !pipelines.length) { vscode.window.showWarningMessage("No authorized Buildkite pipeline is available."); return; }
    const pipeline = preset ? { label: preset.pipeline.name, pipeline: preset.pipeline } : await vscode.window.showQuickPick(pipelines.map(p => ({ label: p.name, description: p.slug, pipeline: p })), { placeHolder: "Choose an authorized pipeline" }); if (!pipeline) return;
    const ref = await vscode.window.showInputBox({ ...(preset ? { title: `Trigger build · ${preset.pipeline.name}`, prompt: "Branch to build", value: preset.branch, placeHolder: "main" } : { prompt: "Branch or commit" }), validateInput: v => v.trim() ? undefined : "A branch or commit is required." }); if (!ref?.trim()) return;
    const message = await vscode.window.showInputBox({ prompt: "Optional build message" }); if (message === undefined) return;
    const envText = await vscode.window.showInputBox({ prompt: "Optional environment variables (KEY=value, one per line)", password: true }); if (envText === undefined) return;
    const env: Record<string, string> = {}; for (const line of envText.split(/\r?\n/)) { if (!line) continue; const i = line.indexOf("="); if (i < 1) { vscode.window.showWarningMessage("Environment variables must use KEY=value."); return; } env[line.slice(0, i)] = line.slice(i + 1); }
    const masked = Object.keys(env).map(k => `${k}=••••••`).join(", ") || "none";
    const confirmation = await vscode.window.showWarningMessage(`Trigger ${pipeline.label} at ${ref.trim()}${message ? `: ${message}` : ""}. Environment: ${masked}`, { modal: true }, "Trigger build"); if (confirmation !== "Trigger build") return;
    try { const client = await this.client(); if (!client) return; await client.trigger(this.state.org.slug, pipeline.pipeline.slug, { commit: ref.trim(), branch: ref.trim(), ...(message ? { message } : {}), ...(Object.keys(env).length ? { env } : {}) }); vscode.window.showInformationMessage("Build triggered."); await this.refresh(); }
    catch (e) { vscode.window.showErrorMessage(`Build was not triggered: ${this.message(e)}`); }
    finally { for (const key of Object.keys(env)) delete env[key]; }
  }
  private message(e: unknown): string { return e instanceof BuildkiteError ? e.message : "Buildkite could not complete that request."; }
}

function safeBuildkiteUrl(value: string): vscode.Uri | undefined { try { const uri = vscode.Uri.parse(value); return uri.scheme === "https" && (uri.authority === "buildkite.com" || uri.authority.endsWith(".buildkite.com")) ? uri : undefined; } catch { return undefined; } }

export function activate(context: vscode.ExtensionContext): void {
  const provider = new BuildkiteProvider(context.secrets); const view = vscode.window.createTreeView("buildkite.explorer", { treeDataProvider: provider, showCollapseAll: false });
  const openUrl = (url: string) => { const uri = safeBuildkiteUrl(url); return uri ? vscode.env.openExternal(uri) : undefined; };
  const buildPage = new BuildPage(context.extensionUri, (org, slug, n) => provider.fetchBuild(org, slug, n), openUrl);
  context.subscriptions.push(provider.onDidChangeTreeData(() => buildPage.syncOrganization(provider.organizationSlug)));
  context.subscriptions.push(provider, buildPage, view, view.onDidChangeVisibility(() => provider.setVisible(view.visible)));
  provider.view = view;
  provider.setVisible(view.visible);
  const commands: [string, (...args: never[]) => unknown][] = [["buildkite.connect", () => provider.connect()], ["buildkite.replaceToken", () => provider.replaceToken()], ["buildkite.disconnect", () => provider.disconnect()], ["buildkite.changeOrganization", () => provider.chooseOrganization()], ["buildkite.openBuildPage", (target: BuildPageTarget) => { const org = provider.organizationSlug; if (org) buildPage.show(target, org); }], ["buildkite.changeFolder", () => provider.chooseFolder()], ["buildkite.openTokenPage", () => vscode.env.openExternal(vscode.Uri.parse(TOKEN_PAGE_URL))], ["buildkite.refresh", () => provider.refresh()], ["buildkite.searchPipelines", () => provider.search()], ["buildkite.retry", () => provider.refresh()], ["buildkite.clearFilter", () => provider.clearFilter()], ["buildkite.loadMore", () => provider.loadMore()], ["buildkite.triggerBuild", () => provider.trigger()], ["buildkite.triggerCurrentProject", () => provider.triggerCurrent()], ["buildkite.expandBuild", (target: BuildTarget) => provider.expandBuild(target)], ["buildkite.openBuild", openUrl]];
  commands.forEach(([id, handler]) => context.subscriptions.push(vscode.commands.registerCommand(id, handler)));
}
export function deactivate(): void {}
