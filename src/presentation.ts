/** Pure presentation helpers (no VS Code dependency) shared by the tree and the build page. */
import type { Build } from "./buildkite";

type BuildLike = Pick<Build, "number" | "state"> & Partial<Build>;

const GREY = "descriptionForeground";
const FINISHED = new Set(["passed", "failed", "canceled", "skipped", "not run", "not_run"]);

export function statusIcon(state: string): { icon: string; color: string } {
  switch (state) {
    case "passed": return { icon: "check", color: "testing.iconPassed" };
    case "failed": return { icon: "close", color: "testing.iconFailed" };
    case "running": return { icon: "loading~spin", color: "charts.blue" };
    case "scheduled": case "creating": case "waiting": return { icon: "clock", color: GREY };
    case "blocked": return { icon: "debug-pause", color: "charts.yellow" };
    case "canceled": case "canceling": case "skipped": case "not run": case "not_run": return { icon: "circle-slash", color: GREY };
    default: return { icon: "circle-outline", color: GREY };
  }
}

export const isFinishedState = (state: string): boolean => FINISHED.has(state);

export function relativeTime(iso: string | undefined, now: Date): string {
  const t = iso ? Date.parse(iso) : NaN;
  if (Number.isNaN(t)) return "";
  const s = Math.max(0, Math.floor((now.getTime() - t) / 1000));
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function absoluteTime(iso: string | undefined): string {
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isNaN(t) ? "—" : new Date(t).toLocaleString();
}

export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
  return `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}m`;
}

export const shortCommit = (commit: string | undefined): string => (commit ?? "").slice(0, 7);

export const firstLine = (message: string | undefined): string =>
  (message ?? "").split(/\r?\n/).map((l) => l.trim()).find((l) => l) ?? "";

export function buildLabel(build: BuildLike): string {
  const line = firstLine(build.message);
  return line ? `#${build.number} ${line}` : `#${build.number}`;
}

export function buildDescription(build: BuildLike, now: Date): string {
  const ref = build.branch || shortCommit(build.commit) || "unknown ref";
  const time = relativeTime(build.started_at ?? (build.created_at as string | undefined), now);
  return time ? `${ref} · ${time}` : ref;
}

const escapeMarkdown = (text: string): string => text.replace(/[\\`*_{}\[\]()#+\-.!|<>~&]/g, "\\$&");

/** Markdown for a tree tooltip; all API text is escaped, so it is safe without isTrusted/supportHtml. */
export function buildTooltip(build: BuildLike): string {
  const msg = (build.message ?? "").trim();
  const lines = [`**${escapeMarkdown(buildLabel(build))}**`];
  if (msg) lines.push("", escapeMarkdown(msg).replace(/\r?\n/g, "  \n"));
  lines.push("",
    `Status: ${escapeMarkdown(build.state)}  `,
    `Branch: ${escapeMarkdown(build.branch || "—")}  `,
    `Commit: ${escapeMarkdown(build.commit || "—")}  `,
    `Author: ${escapeMarkdown(build.creator?.name || "—")}  `,
    `Started: ${escapeMarkdown(absoluteTime(build.started_at))}  `,
    `Finished: ${escapeMarkdown(absoluteTime(build.finished_at))}`);
  return lines.join("\n");
}
