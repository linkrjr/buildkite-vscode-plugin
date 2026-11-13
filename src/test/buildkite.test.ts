import test from "node:test";
import assert from "node:assert/strict";
import { BuildkiteClient, BuildkiteError, normalizeRepository } from "../buildkite";

test("normalizes equivalent SSH and HTTPS repository remotes", () => {
  const expected = "github.com/buildkite/example";
  assert.equal(normalizeRepository("git@github.com:buildkite/example.git"), expected);
  assert.equal(normalizeRepository("ssh://git@github.com/buildkite/example.git/"), expected);
  assert.equal(normalizeRepository("https://github.com/buildkite/example"), expected);
});

test("does not include API response contents in errors", async () => {
  const client = new BuildkiteClient("super-secret", async () => new Response('{"message":"super-secret"}', { status: 401 }));
  await assert.rejects(client.organizations(), (error: unknown) => {
    assert.ok(error instanceof BuildkiteError);
    assert.equal(error.message, "Buildkite could not authenticate this token.");
    assert.equal(error.message.includes("super-secret"), false);
    return true;
  });
});

test("creates trigger request with authorization header but does not expose it in return data", async () => {
  let received: RequestInit | undefined;
  const client = new BuildkiteClient("secret", async (_url, init) => { received = init; return new Response('{"number":1,"state":"scheduled"}', { status: 201 }); });
  const build = await client.trigger("org", "pipeline", { commit: "main", branch: "main", env: { DEPLOY_KEY: "value" } });
  assert.equal(build.number, 1);
  assert.equal((received?.headers as Record<string, string>).Authorization, "Bearer secret");
});
