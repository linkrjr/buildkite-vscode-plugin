---
title: Welcome screens, view subtitle and overflow menu
status: done
created-at: 2026-11-18
---

# Intent: Welcome screens, view subtitle and overflow menu

Author: Ronaldo Gomes. Status: done

## Problem

Not-connected and no-organization states are plain text rows; organization and workspace are shown as text rows in the tree.

## Proposed outcome

- AC1: When no token is stored, the view shows a welcome screen with a short explanation, a full-width "Connect Buildkite" button and a link that opens Buildkite's API access token page; no tree rows are shown.
- AC2: When a token is stored but no organization is selected, the view shows a welcome screen with a "Select organization" button and a "Replace token" link.
- AC3: When an authentication error occurs, the view returns to the welcome screen of AC2 with a non-sensitive message and a "Replace token" button.
- AC4: When connected, the view title's subtitle shows "<organization name> · <workspace folder name>", and the tree has no plain-text "Organization:", "Workspace:" or "Current project:" rows.
- AC5: The view title overflow menu contains Change organization, Replace token and Disconnect; it also contains Select workspace folder only when the workspace has more than one folder.

## Affected users and systems

Developers opening the sidebar. package.json (viewsWelcome, menus, context keys) and the extension's root tree logic.

## Constraints

Spec: docs/specs/sidebar-and-build-page-redesign.md (read the Detailed behaviour and Business rules sections). Tech stack unchanged: TypeScript, VS Code extension API, tsc, node:test, npm; no new runtime dependencies. Token and trigger environment values must never appear in UI, tooltips, messages or the build page. Use VS Code viewsWelcome contributions with context keys (e.g. buildkite.state = disconnected | noOrganization | authError | connected) so the tree returns no rows in those states. Token page link: https://buildkite.com/user/api-access-tokens. Subtitle via TreeView.description ('<org>' alone when no folder). Remove the 'Select workspace folder' tree row; the command moves to the overflow menu gated on a workspaceFolderCount > 1 context. Until T4 lands, the connected tree may keep the 'Current project:' info row only if removing it breaks behaviour — prefer removing Organization/Workspace rows now and leaving current-project display to T4.

## Out of scope

Current project / My Pipelines sections (T4), search/loading/error rows (T7).

## Open questions

None
