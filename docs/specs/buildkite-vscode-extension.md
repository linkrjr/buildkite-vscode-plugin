# Buildkite VS Code extension

Type: FEATURE

## Problem

Developers need to see the state of the Buildkite work associated with the project they have open without leaving VS Code. They also need a safe way to browse only the Buildkite pipelines their account can access and trigger an allowed pipeline when appropriate, without leaking their Buildkite token or supplied environment-variable values.

## User stories

- As a developer, I can securely connect my Buildkite account so that I can use Buildkite from VS Code without repeatedly entering my token.
- As a developer, I can select one Buildkite organization available to my account so that the extension shows only its authorized pipelines.
- As a developer, I can see the current pipeline and recent builds for my open project so that I can monitor its CI work in context.
- As a developer, I can browse and search the pipelines I am allowed to access so that I can find relevant Buildkite projects.
- As a developer, I can expand a build and open it in Buildkite so that I can inspect its status in either VS Code or the full Buildkite interface.
- As a developer, I can trigger a permitted pipeline with a branch or commit so that I can start a build without leaving VS Code.

## Acceptance criteria

- AC1: The extension provides a dedicated Buildkite view in the VS Code Activity Bar sidebar.
- AC2: A user can connect by entering a Buildkite user token; the token is stored only in VS Code encrypted secret storage and is never written to workspace or user settings, files, terminal output, logs, telemetry, notifications, or error messages.
- AC3: The token-entry interface masks the token, never displays it again, and offers non-sensitive Connect, Replace token, and Disconnect actions.
- AC4: After connecting, the user selects one organization from only the organizations available to that token. A Change organization action in the view-title overflow menu shows only currently allowed organizations.
- AC5: The panel shows the selected organization as a label immediately above an expandable My Pipelines section. The section lists only pipelines that the selected organization and token permit the user to see; each pipeline is expandable to reveal its recent builds. It initially shows the first 50 alphabetically, supports search, and offers Load more.
- AC6: For the selected workspace folder, the extension matches only its `origin` Git remote against Buildkite pipeline repository URLs, treating equivalent SSH and HTTPS forms as the same repository.
- AC7: In a multi-root workspace, a folder selector controls which workspace folder is used for pipeline matching and current-build display.
- AC8: When exactly one pipeline matches, the panel identifies it as the current project. Expanding that pipeline in My Pipelines shows its latest 20 builds across all statuses. Each build row contains build number, status, branch or commit, author, message, and start/finish time when available.
- AC9: Selecting a build expands its Buildkite metadata and a job list with job name, status, duration, and exit code when available. It also provides an Open in Buildkite link for that build.
- AC10: While the view is visible, data refreshes every 60 seconds and can be refreshed with a visible right-aligned Refresh button on the My Pipelines section. The same section provides visible right-aligned Trigger build and Search pipelines buttons. Buildkite response data remains in memory only and is not retained between VS Code sessions.
- AC11: If no Git remote matches, or multiple pipelines match, the panel states that no unique pipeline was found and offers Refresh; it does not offer a manual pipeline override.
- AC12: If a token is invalid, expired, or unauthorized, the panel shows a non-sensitive connection error and a Replace token action, without exposing token text or response content that could include it.
- AC13: Disconnect deletes the token from secure storage immediately and clears all in-memory Buildkite data.
- AC14: A user can trigger a build for any pipeline in My pipelines by supplying a pipeline and a branch or commit, with optional message and environment variables.
- AC15: Before triggering, the extension shows a confirmation containing the pipeline, branch/commit, and message; environment-variable values are masked.
- AC16: Triggered-build environment-variable values are used for that request only and are never persisted, included in follow-up display, logged, sent to telemetry, or printed to a terminal.
- AC17: Successful and failed trigger attempts receive clear, non-sensitive feedback; a successful trigger refreshes the relevant build information.

## Detailed behaviour

On first opening the Buildkite sidebar, a disconnected state explains that a Buildkite user token is required and offers Connect Buildkite. Token entry is masked. The extension securely retains only the token after a successful connection; it does not echo or otherwise expose it. The user then selects one organization from the organizations accessible to that token.

The connected view's title bar is limited to the Buildkite title and its overflow menu. That menu contains Change organization, Replace token, and Disconnect. The selected organization appears as a label directly above the expandable My Pipelines area. The My Pipelines area has visible right-aligned Refresh, Trigger build, and Search pipelines buttons. It contains a collapsible item for every displayed pipeline. The Change organization action re-queries and presents only organizations available to the stored token. Disconnect removes the secure token and clears the panel's in-memory Buildkite data.

The extension uses the selected folder's `origin` Git remote to identify a current pipeline. It normalizes equivalent SSH and HTTPS repository-address forms. If there is exactly one match, it identifies the pipeline as the current project. Expanding any pipeline loads that pipeline's 20 most recent builds regardless of status. A build row can expand to show its metadata and jobs, and provides an Open in Buildkite link. The extension does not show job-log output in the sidebar.

My pipelines includes only authorized pipelines in the selected organization. It displays the first 50 in alphabetical order, supports search, and lets the user Load more accessible pipelines. It is also the source of allowed targets for triggering a build.

The Trigger build flow lets the user choose any pipeline from My pipelines, enter a branch or commit, and optionally enter a message and environment variables. Before request submission, a confirmation presents the non-sensitive inputs and masks all environment-variable values. Those values are sent only for the requested trigger, are discarded immediately afterward, and must not be surfaced in messages, UI history, logs, terminal output, or telemetry. On success, the extension provides success feedback and refreshes pertinent build data; on failure, it provides a non-sensitive error and preserves no secret values.

While visible, the sidebar automatically refreshes authorized data every 60 seconds. A manual Refresh action is always available when connected. Data is held in memory for the active session only.

The panel provides clear, actionable states for loading, no open workspace, selected folder without a Git remote, no unique pipeline match, no recent builds, no accessible pipelines, API or network failure, expired/invalid/unauthorized token, trigger submission in progress, trigger success, and trigger failure. Loading states avoid presenting stale data as current. Errors do not reveal credentials, request headers, environment-variable values, or raw server payloads.

## Access and permissions

The extension is for VS Code users who hold a Buildkite user token with access to at least one organization. The user can see only organizations, pipelines, builds, jobs, and trigger targets that Buildkite authorizes for that token. The extension does not grant access beyond Buildkite's own authorization decisions.

## Business rules

- The user token is treated as a secret: it is stored exclusively in VS Code encrypted secret storage and never displayed, written to settings, cached in files, or included in logs, telemetry, terminal output, notifications, errors, diagnostics, or links.
- The selected organization is chosen from organizations returned as accessible to the token and can be changed from the panel.
- Only the selected workspace folder participates in current-project matching; `origin` is the sole remote considered.
- A unique repository match is required before current builds are shown. Zero or multiple matches are not resolved automatically or manually.
- The current-build list has a default and maximum initial size of 20 builds.
- My pipelines has a default initial page size of 50 alphabetically ordered pipelines; additional authorized pipelines appear only after Load more or a search.
- Automatic refresh occurs at 60-second intervals only while the panel is visible. Manual refresh remains available.
- Non-secret Buildkite responses are session-memory-only and are cleared on disconnect or VS Code session end.
- A trigger requires a chosen authorized pipeline and a branch or commit. Message and environment variables are optional.
- Environment-variable values are sensitive by default and are masked in confirmation. They are never persisted or displayed after submission.
- Triggering is allowed only after explicit confirmation. A failed trigger does not retain submitted environment-variable values.

## Scope

- In scope: secure token connection and replacement, organization selection, project-to-pipeline matching, authorized pipeline browsing/search/loading, current build and job metadata, periodic and manual refresh, opening a build in Buildkite, and confirmed triggering of authorized builds.
- Out of scope: job-log streaming or display, manual repository-to-pipeline mapping, persistent caching of Buildkite response data, build cancellation, retrying builds, editing existing builds, deployments, and support for CI providers other than Buildkite.
- Must stay unchanged: standard VS Code workspace and Git behavior; no token, environment-variable value, or other sensitive authentication material may be exposed through settings, local files, logs, telemetry, messages, diagnostics, or terminal output.
