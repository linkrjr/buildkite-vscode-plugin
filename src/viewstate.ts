import { BuildkiteError } from "./buildkite";

export type ViewState = "disconnected" | "noOrganization" | "authError" | "connected";
export const TOKEN_PAGE_URL = "https://buildkite.com/user/api-access-tokens";

export function viewState(s: { hasToken: boolean; hasOrg: boolean; authError: boolean }): ViewState {
  if (!s.hasToken) return "disconnected";
  if (s.hasOrg) return "connected";
  return s.authError ? "authError" : "noOrganization";
}

export function viewSubtitle(org: string, folder: string | undefined): string {
  return folder ? `${org} · ${folder}` : org;
}

export function isAuthFailure(e: unknown): boolean {
  return e instanceof BuildkiteError && e.kind === "authentication";
}
