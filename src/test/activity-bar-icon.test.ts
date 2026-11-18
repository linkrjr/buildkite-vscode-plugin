import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(__dirname, "..", "..");
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const iconPath: string = manifest.contributes.viewsContainers.activitybar[0].icon;
const svg = readFileSync(join(root, iconPath), "utf8");

test("AC27: activity bar icon is a 24x24 single-colour theme-following mark", () => {
  assert.match(svg, /viewBox="0 0 24 24"/);
  const paths = svg.match(/<path\b[^>]*>/g) ?? [];
  assert.ok(paths.length >= 1);
  for (const p of paths) {
    assert.match(p, /fill="currentColor"/);
    assert.doesNotMatch(p, /stroke/);
  }
  assert.doesNotMatch(svg, /#[0-9a-fA-F]{3,8}\b|rgb\(|<image|<text|<style|href=/);
  assert.doesNotMatch(svg, /M4 3h16v18H4z/, "old generic bars icon must be replaced");
});
