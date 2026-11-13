export interface Organization { slug: string; name: string }
export interface Pipeline { slug: string; name: string; repository?: string; provider?: { repository?: string }; web_url?: string }
export interface Job { name?: string; type?: string; state?: string; started_at?: string; finished_at?: string; exit_status?: number; web_url?: string }
export interface Build {
  number: number; state: string; branch?: string; commit?: string; message?: string; creator?: { name?: string; email?: string };
  started_at?: string; finished_at?: string; web_url?: string; jobs?: Job[]; [key: string]: unknown
}

/** Deliberately omits response bodies: API messages may contain sensitive request data. */
export class BuildkiteError extends Error {
  constructor(public readonly kind: "authentication" | "authorization" | "network" | "api") {
    super(kind === "authentication" ? "Buildkite could not authenticate this token." :
      kind === "authorization" ? "Buildkite did not authorize that action." :
      kind === "network" ? "Could not reach Buildkite." : "Buildkite could not complete that request.");
  }
}

export class BuildkiteClient {
  private readonly baseUrl = "https://api.buildkite.com/v2";
  constructor(private readonly token: string, private readonly request: typeof fetch = fetch) {}

  private async call<T>(path: string, init?: RequestInit): Promise<T> {
    let response: Response;
    try {
      response = await this.request(`${this.baseUrl}${path}`, {
        ...init,
        headers: { Authorization: `Bearer ${this.token}`, Accept: "application/json", ...(init?.headers ?? {}) }
      });
    } catch { throw new BuildkiteError("network"); }
    if (!response.ok) {
      if (response.status === 401) throw new BuildkiteError("authentication");
      if (response.status === 403) throw new BuildkiteError("authorization");
      throw new BuildkiteError("api");
    }
    try { return await response.json() as T; } catch { throw new BuildkiteError("api"); }
  }

  organizations(): Promise<Organization[]> { return this.call("/organizations"); }
  pipelines(org: string, page = 1, perPage = 100): Promise<Pipeline[]> {
    return this.call(`/organizations/${encodeURIComponent(org)}/pipelines?page=${page}&per_page=${perPage}`);
  }
  builds(org: string, pipeline: string): Promise<Build[]> {
    return this.call(`/organizations/${encodeURIComponent(org)}/pipelines/${encodeURIComponent(pipeline)}/builds?per_page=20&exclude_jobs=true`);
  }
  build(org: string, pipeline: string, number: number): Promise<Build> {
    return this.call(`/organizations/${encodeURIComponent(org)}/pipelines/${encodeURIComponent(pipeline)}/builds/${number}`);
  }
  trigger(org: string, pipeline: string, payload: { commit: string; branch: string; message?: string; env?: Record<string, string> }): Promise<Build> {
    return this.call(`/organizations/${encodeURIComponent(org)}/pipelines/${encodeURIComponent(pipeline)}/builds`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
    });
  }
}

/** Converts GitHub/Bitbucket-style SSH and HTTPS remotes to one comparison key. */
export function normalizeRepository(remote: string): string | undefined {
  try {
    const value = remote.trim().replace(/\/$/, "");
    if (!value || /[\s]/.test(value)) return undefined;
    const ssh = value.match(/^(?:ssh:\/\/)?(?:[^@/]+@)?([^:/]+)[:/]([^/]+)\/(.+)$/i);
    const http = value.match(/^https?:\/\/([^/]+)\/([^/]+)\/(.+)$/i);
    const match = ssh ?? http;
    if (!match) return undefined;
    return `${match[1].toLowerCase()}/${match[2].toLowerCase()}/${match[3].replace(/\.git$/i, "").toLowerCase()}`;
  } catch { return undefined; }
}

export function pipelineRepository(pipeline: Pipeline): string | undefined {
  return pipeline.repository ?? pipeline.provider?.repository;
}
