# Sidebar and build page redesign

Type: FEATURE
Tech stack: TypeScript, VS Code extension API (tree view, welcome views, webview panel), tsc, Node built-in test runner (node:test), npm; no runtime dependencies, no datastore

## Problem
The extension works, but the panel is hard to read. Everything is plain text in one tree: no icons, build states as bare words, raw ISO timestamps, long rows packed with " · ", and setup steps and status messages shown as ordinary rows. Users cannot see at a glance whether their project's builds pass, and build details are cramped into nested tree rows.

## User stories
- As a developer, I can see my current project's recent builds with clear status icons and relative times so that I know at a glance whether CI is green.
- As a developer, I can click a build to open a readable build page in an editor tab so that I can inspect its jobs without digging through nested rows.
- As a developer, I can trigger a build of my current project from its section with my current branch pre-filled so that I don't pick the pipeline and type the branch every time.
- As a new user, I see a clear welcome screen with a Connect button so that I know how to get started.

## Acceptance criteria
- AC1: When no token is stored, the view shows a welcome screen with a short explanation, a full-width "Connect Buildkite" button and a link that opens Buildkite's API access token page; no tree rows are shown.
- AC2: When a token is stored but no organization is selected, the view shows a welcome screen with a "Select organization" button and a "Replace token" link.
- AC3: When an authentication error occurs, the view returns to the welcome screen of AC2 with a non-sensitive message and a "Replace token" button.
- AC4: When connected, the view title's subtitle shows "<organization name> · <workspace folder name>", and the tree has no plain-text "Organization:", "Workspace:" or "Current project:" rows.
- AC5: The view title overflow menu contains Change organization, Replace token and Disconnect; it also contains Select workspace folder only when the workspace has more than one folder.
- AC6: When exactly one pipeline matches the selected folder, the tree's first section is labelled "Current project" with the pipeline name as its description, is expanded by default, and lists that pipeline's 20 most recent builds.
- AC7: When no pipeline uniquely matches, the Current project section contains exactly one muted row whose text states the reason: the folder has no origin remote, no pipeline uses this repository, or "<N> pipelines use this repository".
- AC8: The Current project section has inline Refresh and Trigger build buttons when a pipeline matches, and only Refresh otherwise.
- AC9: Trigger build from the Current project section skips pipeline selection, pre-fills the branch field with the selected folder's current Git branch (editable, empty if detached or unknown), and then follows the existing message, environment-variable and masked-confirmation steps unchanged.
- AC10: The second section is labelled "My Pipelines (<total accessible count>)", keeps its inline Refresh, Trigger build and Search buttons, and keeps the 50-per-page alphabetical list with Load more.
- AC11: While a search filter is active, the My Pipelines description reads "“<query>” · <matches> of <total>", and the Search button is replaced by a Clear filter button that restores the full list.
- AC12: Each build row shows a status icon, the label "#<number> <first line of message>" (or "#<number>" with no message), and the description "<branch or short commit> · <relative time>".
- AC13: Status icons and colours follow the theme: passed shows a green check; failed shows a red cross; running shows a blue animated spinner; scheduled, creating and waiting show a grey clock; blocked shows a yellow pause; canceled, canceling, skipped and not run show a grey slash. Any other state shows a grey circle.
- AC14: Hovering a build row shows a tooltip with status, branch, full commit, author, full message, and absolute start and finish times.
- AC15: Build rows have no expand arrow. Clicking a build row opens the build page; an inline button on the row opens the build in Buildkite in the browser.
- AC16: A pipeline row shows a neutral pipeline icon until its builds have loaded, then shows the icon of its most recent build's state. The pipeline matching the current project shows a star after its name.
- AC17: While data is refreshing, the view shows its progress bar under the title, and previously loaded rows remain visible.
- AC18: When a non-authentication error occurs, a single row with a red error icon and the non-sensitive error message appears at the top of the tree with an inline Retry button; it disappears after a successful refresh.
- AC19: The build page opens in one editor tab titled "<pipeline name> #<number>". Clicking another build reuses the same tab and shows the new build.
- AC20: The build page header shows the pipeline name, build number, a coloured status badge, branch, 7-character commit, author, full message, relative start time, total duration (or "running for <duration>" while unfinished), an Open in Buildkite button and a Refresh button.
- AC21: Below the header, the build page lists every job with its status icon, name, duration, exit code (when present) and a link that opens that job in Buildkite; a build with no jobs shows "No jobs yet".
- AC22: The build page shows a loading state while fetching and, on failure, a non-sensitive error message with a Retry button.
- AC23: While the build page is visible and its build is not finished, it refreshes every 10 seconds; polling stops once the build finishes or the tab is hidden, and resumes when the tab is shown again for an unfinished build.
- AC24: The build page uses the editor theme's colours and fonts and remains readable in light, dark and high-contrast themes.
- AC25: The build page closes when the user disconnects or changes organization.
- AC26: The build page loads no remote scripts, styles, fonts or images and never contains the token or trigger environment values.
- AC27: The Activity Bar icon is a single-colour Buildkite-style mark that follows the theme's icon colour.

## Detailed behaviour

### Not connected
The view shows VS Code welcome content: "Connect a Buildkite API access token to see your pipelines and builds.", a full-width Connect Buildkite button (opens the existing masked token input), and a link "Need a token? Create one in Buildkite" that opens Buildkite's token page in the browser.

### Connected, no organization
Welcome content: "Choose a Buildkite organization to continue.", a Select organization button, and a Replace token link. After an authentication error, the same screen shows "Your Buildkite token is invalid or expired." with a Replace token button.

### Connected
The view title shows "Buildkite" with the subtitle "<org> · <folder>" (only "<org>" when no folder is open). The title bar keeps its overflow menu.

The tree has two top-level sections:

```
▾ ★ Current project   api-service              ↻ ▷
    ✔ #482 Fix login redirect        main · 3m ago
    ⟳ #483 Bump deps                 renovate/x · now
▾ My Pipelines (37)   “api” · 4 of 37          ↻ ▷ ✕
  ▸ ✔ api-service ★
  ▸ ⎇ api-gateway
```

- Current project: lists builds directly (no nested pipeline row). With no unique match it shows one muted row with an info icon and the reason; hovering it explains how matching works (origin remote vs pipeline repository).
- My Pipelines: pipeline rows expand to their 20 most recent builds. "No accessible pipelines" and "No pipelines match “<query>”" appear as muted rows. "Load more" appears as the last row with a "more" icon.
- An expanded pipeline with no builds shows a muted "No recent builds" row.
- Relative times: "now" under a minute, then "Nm ago", "Nh ago", "Nd ago"; tooltips show absolute local date and time.
- Branch falls back to a 7-character commit, then "unknown ref".

Loading uses the view's progress bar. Errors use one row at the top of the tree with a red error icon and Retry.

### Build page
Single reused editor tab, titled "<pipeline> #<number>", with the Buildkite icon.

```
api-service  #482                 [↻ Refresh] [Open in Buildkite ↗]
● Passed   ⎇ main   a1b2c3d   Jane Doe
Fix login redirect
Started 12m ago · took 4m 10s

Jobs (4)
✔ Lint              32s     exit 0   ↗
✔ Unit tests        2m 01s  exit 0   ↗
✖ E2E               1m 40s  exit 1   ↗
◷ Deploy            —       waiting  ↗
```

- Status badge uses the same state-to-colour mapping as the tree.
- Durations: "Ns" under a minute, "Nm SSs" under an hour, "Nh MMm" beyond.
- Loading: header placeholder with "Loading build…". Error: message plus Retry. Retry and Refresh re-fetch the build.
- Polling: every 10 seconds while visible and unfinished.
- Links open only https buildkite.com URLs, as today.
- Disconnect or organization change closes the tab.

## Access and permissions
Unchanged. Users see only the organizations, pipelines, builds and jobs their token authorizes. The build page is local to the user's VS Code and shows only data already permitted by the token.

## Business rules
- Builds per pipeline and in Current project: 20 most recent. Pipelines per page: 50, alphabetical, Load more adds 50.
- Sidebar auto-refresh: every 60 seconds while visible. Build page auto-refresh: every 10 seconds while visible and the build is unfinished.
- Finished states: passed, failed, canceled, skipped, not run. Every other state is unfinished.
- Pre-filled branch: the selected folder's current Git branch; empty when detached or unavailable.
- Token and trigger environment values must never appear in the tree, tooltips, the build page, or messages.

## Scope
- In scope: welcome screens, view subtitle, section layout, status icons and colours, relative times and tooltips, search filter display and clear, error and loading presentation, Current project quick trigger, build page, new Activity Bar icon.
- Out of scope: job logs, rebuild, cancel, unblock, persistent caching, user settings, other CI providers, manual pipeline mapping.
- Must stay unchanged: token storage and secrecy rules, environment-variable masking and disposal, organization and pipeline authorization, origin-remote repository matching, 60-second sidebar refresh, 20-build and 50-pipeline limits, the trigger flow's steps and confirmation, and opening only https Buildkite URLs.
