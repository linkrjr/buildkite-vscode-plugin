---
title: Current project and My Pipelines sections with styled build rows
status: todo
created-at: 2026-11-18
---

# Intent: Current project and My Pipelines sections with styled build rows

Author: Ronaldo Gomes. Status: todo

## Problem

The tree mixes info rows and actions, shows builds as long text rows, and buries the current project's builds.

## Proposed outcome

Two top-level sections using the T1 helpers.

- AC6: When exactly one pipeline matches the selected folder, the tree's first section is labelled "Current project" with the pipeline name as its description, is expanded by default, and lists that pipeline's 20 most recent builds.
- AC7: When no pipeline uniquely matches, the Current project section contains exactly one muted row whose text states the reason: the folder has no origin remote, no pipeline uses this repository, or "<N> pipelines use this repository".
- AC8 (Refresh part only): The Current project section has an inline Refresh button (Trigger button comes in T8).
- AC10: The second section is labelled "My Pipelines (<total accessible count>)", keeps its inline Refresh, Trigger build and Search buttons, and keeps the 50-per-page alphabetical list with Load more.
- AC12: Each build row shows a status icon, the label "#<number> <first line of message>" (or "#<number>" with no message), and the description "<branch or short commit> · <relative time>".
- AC13: (as rendered in the tree) status icons and colours per the T1 mapping.
- AC14: Hovering a build row shows a tooltip with status, branch, full commit, author, full message, and absolute start and finish times.
- AC16: A pipeline row shows a neutral pipeline icon until its builds have loaded, then shows the icon of its most recent build's state. The pipeline matching the current project shows a star after its name.

## Affected users and systems

Developers using the sidebar. The extension's tree provider and package.json menus.

## Constraints

Spec: docs/specs/sidebar-and-build-page-redesign.md (read the Detailed behaviour and Business rules sections). Tech stack unchanged: TypeScript, VS Code extension API, tsc, node:test, npm; no new runtime dependencies. Token and trigger environment values must never appear in UI, tooltips, messages or the build page. Depends on T1 (helpers) and T3 (root/welcome changes) being merged. Build rows stay expandable to jobs for now (T6 turns them into leaf rows that open the build page) — or keep current expand behaviour unchanged. Muted rows: info codicon, description-foreground colour; no-match tooltip explains matching (origin remote vs pipeline repository URL). Empty states: 'No accessible pipelines', 'No recent builds' as muted rows; Load more with a 'more' icon. Keep 20-build and 50-pipeline limits, 60s refresh, origin-only matching.

## Out of scope

Search filter display/clear, progress bar and error row (T7); quick trigger (T8); build page (T5/T6).

## Open questions

None
