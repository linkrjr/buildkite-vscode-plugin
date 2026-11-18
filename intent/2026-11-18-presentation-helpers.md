---
title: Presentation helpers for build status and times
status: done
created-at: 2026-11-18
---

# Intent: Presentation helpers for build status and times

Author: Ronaldo Gomes. Status: done

## Problem

Build states show as bare words and times as raw ISO strings. Every redesigned surface (tree rows, tooltips, build page) needs the same state-to-icon/colour mapping and the same time and duration formatting.

## Proposed outcome

A pure, VS Code-independent helper module with unit tests that provides: state → icon id + theme colour id (per AC13), finished-state check, relative time, absolute local time, duration formatting, short commit, first line of message, and builders for a build row's label, description and tooltip text. Nothing in the tree uses it yet.

- AC12 (text format part): Each build row shows a status icon, the label "#<number> <first line of message>" (or "#<number>" with no message), and the description "<branch or short commit> · <relative time>".
- AC13: Status icons and colours follow the theme: passed shows a green check; failed shows a red cross; running shows a blue animated spinner; scheduled, creating and waiting show a grey clock; blocked shows a yellow pause; canceled, canceling, skipped and not run show a grey slash. Any other state shows a grey circle.
- AC14 (text part): Hovering a build row shows a tooltip with status, branch, full commit, author, full message, and absolute start and finish times.

## Affected users and systems

Developers reading the sidebar and build page. New helper module under src plus tests under src/test.

## Constraints

Spec: docs/specs/sidebar-and-build-page-redesign.md (read the Detailed behaviour and Business rules sections). Tech stack unchanged: TypeScript, VS Code extension API, tsc, node:test, npm; no new runtime dependencies. Token and trigger environment values must never appear in UI, tooltips, messages or the build page. Relative times: 'now' under a minute, then 'Nm ago', 'Nh ago', 'Nd ago'. Durations: 'Ns' under a minute, 'Nm SSs' under an hour, 'Nh MMm' beyond. Short commit = 7 chars. Branch fallback: short commit, then 'unknown ref'. Finished states: passed, failed, canceled, skipped, not run (accept Buildkite's 'not_run' form too). Icons are VS Code codicons with ThemeColor ids (e.g. testing.iconPassed / testing.iconFailed / charts.blue / charts.yellow / disabledForeground or descriptionForeground). Running spinner = codicon 'loading~spin'. Helpers take 'now' as a parameter so tests are deterministic. No dependencies.

## Out of scope

Wiring helpers into the tree (T4) or build page (T5).

## Open questions

None
