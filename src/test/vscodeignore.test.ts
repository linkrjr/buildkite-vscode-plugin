import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const lines = readFileSync(join(__dirname, "..", "..", ".vscodeignore"), "utf8")
  .split(/\r?\n/)
  .map((l) => l.trim());

for (const pattern of ["graphify-out/**", "intent/**", "tmp/**", "out/test/**"]) {
  test(`.vscodeignore excludes ${pattern}`, () => {
    assert.ok(lines.includes(pattern));
  });
}

test(".vscodeignore does not exclude shipped files", () => {
  for (const shipped of ["resources/**", "out/**", "out/*.js"]) {
    assert.ok(!lines.includes(shipped));
  }
});
