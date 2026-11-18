---
title: Search filter display, progress bar and error row
status: todo
created-at: 2026-11-18
---

# Intent: Search filter display, progress bar and error row

Author: Ronaldo Gomes. Status: todo

## Problem

Search state is shown by rewriting the section label; loading is a 'Refreshing…' text row; errors are plain text rows.

## Proposed outcome

- AC11: While a search filter is active, the My Pipelines description reads "“<query>” · <matches> of <total>", and the Search button is replaced by a Clear filter button that restores the full list.
- AC17: While data is refreshing, the view shows its progress bar under the title, and previously loaded rows remain visible.
- AC18: When a non-authentication error occurs, a single row with a red error icon and the non-sensitive error message appears at the top of the tree with an inline Retry button; it disappears after a successful refresh.

## Affected users and systems

Developers using the sidebar. Tree provider, package.json commands/menus.

## Constraints

Spec: docs/specs/sidebar-and-build-page-redesign.md (read the Detailed behaviour and Business rules sections). Tech stack unchanged: TypeScript, VS Code extension API, tsc, node:test, npm; no new runtime dependencies. Token and trigger environment values must never appear in UI, tooltips, messages or the build page. Depends on T4. Progress via vscode.window.withProgress({ location: { viewId: 'buildkite.explorer' } }). Error row: 'error' codicon with errorForeground colour, Retry = refresh command inline. Clear filter command uses the clear-all or close codicon, gated by a context key/contextValue. Show 'No pipelines match “<query>”' as a muted row when the filter matches nothing.

## Out of scope

Authentication-error welcome screen (T3).

## Open questions

None
