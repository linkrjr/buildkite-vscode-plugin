import * as vscode from "vscode";
import { randomBytes } from "node:crypto";
import { Build, BuildkiteError } from "./buildkite";
import { POLL_INTERVAL_MS, buildPageDocument, renderBuildPage, shouldPoll, BuildPageModel } from "./buildPageHtml";

export interface BuildPageTarget { pipeline: { slug: string; name: string }; number: number }
type Fetch = (pipelineSlug: string, number: number) => Promise<Build>;
type OpenUrl = (url: string) => unknown;

/** One reused editor tab showing a build; polls every 10 s while visible and unfinished. */
export class BuildPage implements vscode.Disposable {
  private panel?: vscode.WebviewPanel;
  private target?: BuildPageTarget;
  private build?: Build;
  private timer?: NodeJS.Timeout;
  private generation = 0;

  constructor(private readonly extensionUri: vscode.Uri, private readonly fetchBuild: Fetch, private readonly openUrl: OpenUrl) {}

  show(target: BuildPageTarget): void {
    this.target = target; this.build = undefined;
    const title = `${target.pipeline.name} #${target.number}`;
    if (this.panel) { this.panel.title = title; this.panel.reveal(undefined, false); }
    else {
      const panel = vscode.window.createWebviewPanel("buildkite.build", title, vscode.ViewColumn.Active, { enableScripts: true, localResourceRoots: [] });
      panel.iconPath = vscode.Uri.joinPath(this.extensionUri, "resources", "buildkite.svg");
      panel.webview.html = buildPageDocument(randomBytes(16).toString("hex"), renderBuildPage({ status: "loading" }, new Date()));
      panel.webview.onDidReceiveMessage((m) => this.onMessage(m));
      panel.onDidChangeViewState(() => { if (panel.visible) { this.schedule(); void this.load(true); } else this.stopTimer(); });
      panel.onDidDispose(() => { this.stopTimer(); this.panel = undefined; this.target = undefined; this.build = undefined; this.generation++; });
      this.panel = panel;
    }
    this.post({ status: "loading" });
    void this.load(false);
  }

  close(): void { this.panel?.dispose(); }
  dispose(): void { this.close(); }

  private post(model: BuildPageModel): void { void this.panel?.webview.postMessage({ html: renderBuildPage(model, new Date()) }); }

  private async load(background: boolean): Promise<void> {
    const target = this.target; if (!target || !this.panel) return;
    const generation = ++this.generation;
    if (background && this.build) this.post({ status: "ready", pipelineName: target.pipeline.name, build: this.build, refreshing: true });
    else this.post({ status: "loading" });
    try {
      const build = await this.fetchBuild(target.pipeline.slug, target.number);
      if (generation !== this.generation || !this.panel) return;
      this.build = build;
      this.post({ status: "ready", pipelineName: target.pipeline.name, build });
    } catch (e) {
      if (generation !== this.generation || !this.panel) return;
      this.stopTimer();
      this.build = undefined;
      this.post({ status: "error", message: e instanceof BuildkiteError ? e.message : "Buildkite could not complete that request." });
      return;
    }
    this.schedule();
  }

  private schedule(): void {
    this.stopTimer();
    if (!shouldPoll(Boolean(this.panel?.visible), this.build?.state)) return;
    this.timer = setTimeout(() => { void this.load(true); }, POLL_INTERVAL_MS);
  }
  private stopTimer(): void { if (this.timer) { clearTimeout(this.timer); this.timer = undefined; } }

  private onMessage(message: unknown): void {
    const m = message as { type?: string; index?: number } | undefined;
    switch (m?.type) {
      case "refresh": case "retry": void this.load(Boolean(this.build)); break;
      case "openBuild": if (this.build?.web_url) this.openUrl(this.build.web_url); break;
      case "openJob": { const url = typeof m.index === "number" ? this.build?.jobs?.[m.index]?.web_url : undefined; if (url) this.openUrl(url); break; }
    }
  }
}
