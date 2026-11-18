/** Pure HTML rendering for the build page (no VS Code dependency, unit-testable). */
import type { Build, Job } from "./buildkite";
import { formatDuration, isFinishedState, relativeTime, shortCommit, statusIcon } from "./presentation";

export type BuildPageModel =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; pipelineName: string; build: Build; refreshing?: boolean };

export const POLL_INTERVAL_MS = 10_000;

export const escapeHtml = (text: string): string =>
  text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const shouldPoll = (visible: boolean, state: string | undefined): boolean =>
  visible && state !== undefined && !isFinishedState(state);

const GLYPH: Record<string, string> = { check: "✓", close: "✕", "loading~spin": "◌", clock: "◷", "debug-pause": "⏸", "circle-slash": "⊘", "circle-outline": "○" };
const LABEL: Record<string, string> = { passed: "Passed", failed: "Failed", running: "Running", scheduled: "Scheduled", creating: "Scheduled", waiting: "Scheduled", blocked: "Blocked", canceled: "Canceled", canceling: "Canceled", skipped: "Canceled", "not run": "Canceled", not_run: "Canceled" };

function icon(state: string): string {
  const { icon: name, color } = statusIcon(state);
  return `<span class="icon c-${color.replace(/\./g, "-")}${name.endsWith("~spin") ? " spin" : ""}" aria-hidden="true">${GLYPH[name] ?? "○"}</span>`;
}

function elapsed(startedAt: string | undefined, finishedAt: string | undefined, now: Date): number | undefined {
  const start = startedAt ? Date.parse(startedAt) : NaN;
  if (Number.isNaN(start)) return undefined;
  const end = finishedAt ? Date.parse(finishedAt) : now.getTime();
  return Number.isNaN(end) ? undefined : end - start;
}

function jobRow(job: Job, index: number, now: Date): string {
  const state = job.state ?? "";
  const ms = elapsed(job.started_at, job.finished_at, now);
  const exit = job.exit_status !== undefined && job.exit_status !== null ? `exit ${job.exit_status}` : (state && !isFinishedState(state) ? state : "");
  const link = job.web_url ? `<button class="link" data-job="${index}" aria-label="Open job in Buildkite">↗</button>` : "<span></span>";
  return `<li class="job"><span class="job-icon" title="${escapeHtml(state)}">${icon(state)}</span><span class="job-name">${escapeHtml(job.name ?? job.type ?? "Job")}</span><span class="job-time">${ms === undefined ? "" : formatDuration(ms)}</span><span class="job-exit mono">${escapeHtml(exit)}</span>${link}</li>`;
}

export function renderBuildPage(model: BuildPageModel, now: Date): string {
  if (model.status === "loading") return `<div class="skeleton" role="status"><span class="sr">Loading build…</span><div class="sk sk-title"></div><div class="sk"></div><div class="sk sk-wide"></div></div><p class="muted">Loading build…</p>`;
  if (model.status === "error") return `<div class="error" role="alert"><span class="err-icon" aria-hidden="true">⊗</span><div><strong>Could not load build</strong><div>${escapeHtml(model.message)}</div></div><button class="btn secondary" data-action="retry">Retry</button></div>`;
  const b = model.build;
  const finished = isFinishedState(b.state);
  const ms = elapsed(b.started_at, b.finished_at, now);
  const started = relativeTime(b.started_at, now);
  const timing = ms === undefined ? "Not started" : `Started ${started} · ${finished ? "took" : "running for"} ${formatDuration(ms)}`;
  const label = LABEL[b.state] ?? "Unknown";
  const jobs = b.jobs ?? [];
  const meta = [`<span class="muted">⎇ ${escapeHtml(b.branch || "—")}</span>`, `<span class="muted mono">${escapeHtml(shortCommit(b.commit) || "—")}</span>`, `<span class="muted">${escapeHtml(b.creator?.name || "Unknown")}</span>`].join("");
  const jobList = jobs.length ? `<ul class="jobs">${jobs.map((j, i) => jobRow(j, i, now)).join("")}</ul>` : `<div class="empty">No jobs yet</div>`;
  const foot = finished ? "" : `<p class="muted foot"><span class="icon spin" aria-hidden="true">◌</span> Refreshes every 10 s while this tab is visible</p>`;
  return `<header><div class="row1"><h1>${escapeHtml(model.pipelineName)} <span class="muted">#${b.number}</span></h1><div class="actions"><button class="btn secondary" data-action="refresh"${model.refreshing ? ' aria-busy="true" disabled' : ""}>${model.refreshing ? '<span class="icon spin" aria-hidden="true">◌</span> ' : ""}Refresh</button><button class="btn primary" data-action="openBuild">Open in Buildkite ↗</button></div></div>
<div class="row2"><span class="badge s-${escapeHtml(statusIcon(b.state).color.replace(/\./g, "-"))}">${icon(b.state)} ${label}</span>${meta}</div>
<p class="message">${escapeHtml((b.message ?? "").trim())}</p><p class="muted">${escapeHtml(timing)}</p></header>
<section><h2>Jobs <span class="chip">${jobs.length}</span></h2>${jobList}${foot}</section>`;
}

const CSS = `
body{margin:0;padding:24px 32px;background:var(--vscode-editor-background);color:var(--vscode-editor-foreground);font-family:var(--vscode-font-family);font-size:var(--vscode-font-size)}
#root{max-width:880px}
.muted{color:var(--vscode-descriptionForeground)}.mono{font-family:var(--vscode-editor-font-family)}.sr{position:absolute;left:-9999px}
h1{font-size:20px;line-height:28px;font-weight:600;margin:0}h2{font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin:24px 0 8px;color:var(--vscode-descriptionForeground)}
.row1{display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center}.actions{display:flex;gap:8px}
.row2{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:12px 0;font-size:13px}
.message{font-size:15px;line-height:22px;white-space:pre-wrap;margin:12px 0 8px}
.btn{font:inherit;padding:4px 12px;border:1px solid transparent;border-radius:2px;cursor:pointer}
.btn.primary{background:var(--vscode-button-background);color:var(--vscode-button-foreground)}.btn.primary:hover{background:var(--vscode-button-hoverBackground)}
.btn.secondary{background:var(--vscode-button-secondaryBackground);color:var(--vscode-button-secondaryForeground)}.btn.secondary:hover{background:var(--vscode-button-secondaryHoverBackground)}
.btn:focus-visible,.link:focus-visible{outline:2px solid var(--vscode-focusBorder);outline-offset:2px}
.badge{display:inline-flex;gap:4px;align-items:center;padding:2px 10px;border-radius:999px;border:1px solid currentColor;font-weight:600;background:color-mix(in srgb,currentColor 16%,transparent)}
.badge .icon{color:inherit}
.icon{display:inline-block}.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
.c-testing-iconPassed{color:var(--vscode-testing-iconPassed)}.c-testing-iconFailed{color:var(--vscode-testing-iconFailed)}.c-charts-blue{color:var(--vscode-charts-blue)}.c-charts-yellow{color:var(--vscode-charts-yellow)}.c-descriptionForeground{color:var(--vscode-descriptionForeground)}
.s-testing-iconPassed{color:var(--vscode-testing-iconPassed)}.s-testing-iconFailed{color:var(--vscode-testing-iconFailed)}.s-charts-blue{color:var(--vscode-charts-blue)}.s-charts-yellow{color:var(--vscode-charts-yellow)}.s-descriptionForeground{color:var(--vscode-descriptionForeground)}
.chip{background:var(--vscode-badge-background);color:var(--vscode-badge-foreground);border-radius:999px;padding:0 6px}
.jobs{list-style:none;margin:0;padding:0;border:1px solid var(--vscode-widget-border,var(--vscode-panel-border));border-radius:4px;background:var(--vscode-editorWidget-background,transparent)}
.job{display:grid;grid-template-columns:20px 1fr 76px 78px 28px;gap:8px;align-items:center;padding:6px 12px;border-top:1px solid var(--vscode-widget-border,var(--vscode-panel-border))}.job:first-child{border-top:0}.job:hover{background:var(--vscode-list-hoverBackground)}
.job-time{text-align:right;font-variant-numeric:tabular-nums}.job-exit{font-size:12px}
.link{background:none;border:0;color:var(--vscode-textLink-foreground);cursor:pointer;font:inherit}
.empty{border:1px dashed var(--vscode-widget-border,var(--vscode-panel-border));border-radius:4px;padding:16px;text-align:center;color:var(--vscode-descriptionForeground)}
.error{display:flex;gap:12px;align-items:center;padding:12px;border:1px solid var(--vscode-inputValidation-errorBorder);border-left-width:4px;background:var(--vscode-inputValidation-errorBackground);color:var(--vscode-inputValidation-errorForeground,inherit)}.error div{flex:1}
.sk{height:14px;margin:12px 0;width:50%;background:var(--vscode-editor-inactiveSelectionBackground);animation:pulse 2s ease-in-out infinite}.sk-title{height:24px;width:30%}.sk-wide{width:90%}@keyframes pulse{50%{opacity:.4}}
.foot{font-size:12px}
@media (max-width:560px){.job{grid-template-columns:20px 1fr 28px}.job-time,.job-exit{grid-column:2}}
body.vscode-high-contrast .badge{background:transparent;color:var(--vscode-editor-foreground);border-color:var(--vscode-contrastBorder,currentColor)}
body.vscode-high-contrast .btn{border-color:var(--vscode-contrastBorder)}body.vscode-high-contrast .jobs{border-color:var(--vscode-contrastBorder)}body.vscode-high-contrast .link{color:var(--vscode-editor-foreground)}
`;

const SCRIPT = `
const vscode = acquireVsCodeApi();
const root = document.getElementById("root");
window.addEventListener("message", (e) => { if (e.data && typeof e.data.html === "string") root.innerHTML = e.data.html; });
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action],[data-job]");
  if (!el) return;
  if (el.dataset.job !== undefined) vscode.postMessage({ type: "openJob", index: Number(el.dataset.job) });
  else vscode.postMessage({ type: el.dataset.action });
});
`;

export function buildPageDocument(nonce: string, fragment: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}'"><meta name="viewport" content="width=device-width, initial-scale=1"><style nonce="${nonce}">${CSS}</style></head><body><div id="root">${fragment}</div><script nonce="${nonce}">${SCRIPT}</script></body></html>`;
}
