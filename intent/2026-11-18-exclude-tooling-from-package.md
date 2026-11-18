---
title: Exclude tooling folders from the packaged extension
status: done
created-at: 2026-11-18
---

# Intent: Exclude tooling folders from the packaged extension

Author: Ronaldo Gomes. Status: done

## Problem

QA on PR #3 found that `vsce ls` includes `graphify-out/**` (the codebase graph committed by this run) and `out/test/**` in the packaged extension. `intent/` and `tmp/` would also ship.

## Proposed outcome

`.vscodeignore` excludes graphify-out/, intent/, tmp/ and out/test/, and a test asserts those patterns are present. `resources/` and `out/*.js` still ship.

## Affected users and systems

Anyone installing the packaged .vsix. `.vscodeignore` only.

## Constraints

No behaviour change. Keep npm + tsc + node:test.

## Out of scope

Any UI work.

## Open questions

None
