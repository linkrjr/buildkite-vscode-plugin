---
title: Buildkite-style Activity Bar icon
status: todo
created-at: 2026-11-18
---

# Intent: Buildkite-style Activity Bar icon

Author: Ronaldo Gomes. Status: todo

## Problem

The Activity Bar icon is three generic bars in a box.

## Proposed outcome

- AC27: The Activity Bar icon is a single-colour Buildkite-style mark that follows the theme's icon colour.

## Affected users and systems

Everyone with the extension installed. resources/ icon file only.

## Constraints

Spec: docs/specs/sidebar-and-build-page-redesign.md (read the Detailed behaviour and Business rules sections). Tech stack unchanged: TypeScript, VS Code extension API, tsc, node:test, npm; no new runtime dependencies. Token and trigger environment values must never appear in UI, tooltips, messages or the build page. 24x24 viewBox, single path(s) with fill=currentColor, no strokes or other colours, readable at 24px, recognisably based on the Buildkite logo (the stacked parallelogram 'kite' mark) without copying any raster asset.

## Out of scope

Any other UI.

## Open questions

None
