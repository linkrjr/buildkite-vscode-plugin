import test from "node:test";
import assert from "node:assert/strict";
import { viewState, viewSubtitle, isAuthFailure, TOKEN_PAGE_URL } from "../viewstate";
import { BuildkiteError } from "../buildkite";

test("AC1 no token is disconnected", () => {
  assert.equal(viewState({ hasToken: false, hasOrg: false, authError: false }), "disconnected");
});
test("AC2 token without organization", () => {
  assert.equal(viewState({ hasToken: true, hasOrg: false, authError: false }), "noOrganization");
});
test("AC3 authentication error wins when a token is stored", () => {
  assert.equal(viewState({ hasToken: true, hasOrg: false, authError: true }), "authError");
});
test("AC3 authentication error never shows without a token", () => {
  assert.equal(viewState({ hasToken: false, hasOrg: false, authError: true }), "disconnected");
});
test("connected with token and organization", () => {
  assert.equal(viewState({ hasToken: true, hasOrg: true, authError: false }), "connected");
});
test("AC4 subtitle is organization · folder", () => {
  assert.equal(viewSubtitle("Acme", "web"), "Acme · web");
});
test("AC4 subtitle is organization alone without folder", () => {
  assert.equal(viewSubtitle("Acme", undefined), "Acme");
});
test("AC1 token page link", () => {
  assert.equal(TOKEN_PAGE_URL, "https://buildkite.com/user/api-access-tokens");
});
test("AC3 authentication BuildkiteError is an auth failure", () => {
  assert.equal(isAuthFailure(new BuildkiteError("authentication")), true);
});
test("AC3 other errors are not auth failures", () => {
  assert.equal(isAuthFailure(new BuildkiteError("network")), false);
  assert.equal(isAuthFailure(new BuildkiteError("authorization")), false);
  assert.equal(isAuthFailure(new Error("authentication")), false);
});
