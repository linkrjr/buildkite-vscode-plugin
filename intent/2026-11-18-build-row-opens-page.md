---
title: Build rows open the build page
status: done
created-at: 2026-11-18
---

# Intent: Build rows open the build page

Author: Ronaldo Gomes. Status: done

## Problem

Once the build page exists, build rows should open it instead of expanding nested detail rows.

## Proposed outcome

- AC15: Build rows have no expand arrow. Clicking a build row opens the build page; an inline button on the row opens the build in Buildkite in the browser.

## Affected users and systems

Developers using the sidebar. Tree provider and package.json view/item/context menus.

## Constraints

Spec: docs/specs/sidebar-and-build-page-redesign.md (read the Detailed behaviour and Business rules sections). Tech stack unchanged: TypeScript, VS Code extension API, tsc, node:test, npm; no new runtime dependencies. Token and trigger environment values must never appear in UI, tooltips, messages or the build page. Depends on T4 and T5. Remove the old in-tree build detail/job rows and the expandBuild path once unused. Inline button uses the link-external codicon and the existing https-buildkite-only URL check.

Also (from QA on PR #7): the build-data allow-list drops `created_at`, so builds that haven't started (scheduled/creating) show no relative time in their row description. Keep `created_at` in the allow-list so the description falls back to it, with a test.

## Out of scope

Build page content (T5).

## Open questions

None
