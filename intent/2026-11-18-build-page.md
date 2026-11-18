---
title: Build page webview
status: done
created-at: 2026-11-18
---

# Intent: Build page webview

Author: Ronaldo Gomes. Status: done

## Problem

Build details are cramped into nested tree rows.

## Proposed outcome

A build page in an editor tab, opened via a new command (e.g. buildkite.openBuildPage taking pipeline + build number).

- AC19: The build page opens in one editor tab titled "<pipeline name> #<number>". Clicking another build reuses the same tab and shows the new build.
- AC20: The build page header shows the pipeline name, build number, a coloured status badge, branch, 7-character commit, author, full message, relative start time, total duration (or "running for <duration>" while unfinished), an Open in Buildkite button and a Refresh button.
- AC21: Below the header, the build page lists every job with its status icon, name, duration, exit code (when present) and a link that opens that job in Buildkite; a build with no jobs shows "No jobs yet".
- AC22: The build page shows a loading state while fetching and, on failure, a non-sensitive error message with a Retry button.
- AC23: While the build page is visible and its build is not finished, it refreshes every 10 seconds; polling stops once the build finishes or the tab is hidden, and resumes when the tab is shown again for an unfinished build.
- AC24: The build page uses the editor theme's colours and fonts and remains readable in light, dark and high-contrast themes.
- AC25: The build page closes when the user disconnects or changes organization.
- AC26: The build page loads no remote scripts, styles, fonts or images and never contains the token or trigger environment values.

## Affected users and systems

Developers inspecting builds. New webview module under src, command registration in the extension, package.json command.

## Constraints

Spec: docs/specs/sidebar-and-build-page-redesign.md (read the Detailed behaviour and Business rules sections). Tech stack unchanged: TypeScript, VS Code extension API, tsc, node:test, npm; no new runtime dependencies. Token and trigger environment values must never appear in UI, tooltips, messages or the build page. Depends on T1. Strict Content-Security-Policy (default-src 'none'; nonce'd inline script/style or local resources via asWebviewUri only). All dynamic text HTML-escaped. Links are posted to the extension host and opened only if they are https buildkite.com URLs (reuse the existing safe URL check). Use VS Code CSS variables (--vscode-*) for colours/fonts; codicons may be drawn as inline SVG or text glyphs, no remote fonts. Single reused WebviewPanel with iconPath = Buildkite icon. Fetch via the existing client's build() with full jobs. Pure HTML rendering function should be unit-testable (escape, states, durations).

## Out of scope

Changing tree build rows to open this page (T6). Job logs, rebuild, cancel.

## Open questions

None
