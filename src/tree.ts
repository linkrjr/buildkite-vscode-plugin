/** Pure tree helpers (no VS Code dependency). */
import { Build, Pipeline, normalizeRepository, pipelineRepository } from "./buildkite";
import { statusIcon } from "./presentation";

export type CurrentProject = { kind: "match"; pipeline: Pipeline } | { kind: "none"; text: string; tooltip: string };

const MATCH_HELP = "A pipeline matches when its repository URL equals this folder's origin remote.";

export function currentProject(remote: string | undefined, pipelines: Pipeline[]): CurrentProject {
  if (!remote) return { kind: "none", text: "This folder has no origin remote", tooltip: `${MATCH_HELP} Add an origin remote to this folder's Git repository.` };
  const key = normalizeRepository(remote);
  const matches = key ? pipelines.filter(p => { const repo = pipelineRepository(p); return repo !== undefined && normalizeRepository(repo) === key; }) : [];
  if (matches.length === 1) return { kind: "match", pipeline: matches[0] };
  return { kind: "none", text: matches.length ? `${matches.length} pipelines use this repository` : "No pipeline uses this repository", tooltip: MATCH_HELP };
}

export function pipelineIcon(builds: Build[] | undefined): { icon: string; color?: string } {
  return builds?.length ? statusIcon(builds[0].state) : { icon: "package" };
}

export const pipelineLabel = (name: string, isCurrent: boolean): string => (isCurrent ? `${name} ★` : name);
export const myPipelinesLabel = (total: number): string => `My Pipelines (${total})`;
