import test from "node:test";
import assert from "node:assert/strict";
import { currentProject, pipelineIcon, pipelineLabel, myPipelinesLabel } from "../tree";

const p = (slug: string, repository: string) => ({ slug, name: slug, repository });

test("AC6 exactly one pipeline matching origin is the current project", () => {
  const r = currentProject("git@github.com:acme/api.git", [p("api", "https://github.com/acme/api"), p("web", "https://github.com/acme/web")]);
  assert.equal(r.kind, "match");
  if (r.kind === "match") assert.equal(r.pipeline.slug, "api");
});
test("AC7 no origin remote", () => {
  const r = currentProject(undefined, [p("api", "https://github.com/acme/api")]);
  assert.equal(r.kind, "none");
  if (r.kind === "none") { assert.match(r.text, /no origin remote/i); assert.ok(r.tooltip.length > 0); }
});
test("AC7 no pipeline uses this repository", () => {
  const r = currentProject("git@github.com:acme/x.git", [p("api", "https://github.com/acme/api")]);
  assert.equal(r.kind === "none" && r.text, "No pipeline uses this repository");
});
test("AC7 several pipelines use this repository", () => {
  const r = currentProject("git@github.com:acme/api.git", [p("a", "https://github.com/acme/api"), p("b", "git@github.com:acme/api.git")]);
  assert.equal(r.kind === "none" && r.text, "2 pipelines use this repository");
});
test("AC7 unparseable remote counts as no match", () => {
  const r = currentProject("???", [p("a", "https://github.com/acme/api")]);
  assert.equal(r.kind === "none" && r.text, "No pipeline uses this repository");
});
test("AC16 pipeline icon is neutral until builds load, then latest build state", () => {
  assert.deepEqual(pipelineIcon(undefined), { icon: "package" });
  assert.deepEqual(pipelineIcon([]), { icon: "package" });
  assert.deepEqual(pipelineIcon([{ number: 2, state: "failed" }, { number: 1, state: "passed" }]), { icon: "close", color: "testing.iconFailed" });
});
test("AC16 star after the current project's pipeline name", () => {
  assert.equal(pipelineLabel("api", true), "api ★");
  assert.equal(pipelineLabel("api", false), "api");
});
test("AC10 My Pipelines label has the total", () => assert.equal(myPipelinesLabel(37), "My Pipelines (37)"));
