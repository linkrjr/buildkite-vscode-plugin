# Buildkite for VS Code

This extension adds a Buildkite view to the Activity Bar. Connect with a Buildkite user token, choose an authorized organization, browse its pipelines, monitor the pipeline matching the selected workspace folder's `origin` remote, open a build's details, and trigger an authorized build.

## Connecting

The view shows a welcome screen until it is connected:

- **Not connected**: a short explanation, a **Connect Buildkite** button and a link that opens Buildkite's API access token page. Connecting asks for a user token (entered as a password) and then for an organization.
- **Token stored, no organization selected**: a **Select organization** button, plus **Replace token** and **Disconnect** links.
- **Authentication error**: if Buildkite rejects the token, the view returns to a welcome screen with a non-sensitive message and **Replace token** and **Disconnect** buttons.

Once connected, the view subtitle reads `<organization> · <workspace folder>`. The `...` menu in the view title offers **Change organization**, **Replace token** and **Disconnect**. **Select workspace folder** appears there only when the workspace has more than one folder.

## Sidebar

The tree has two sections. It refreshes when the view becomes visible and every 60 seconds while it stays visible. A progress bar shows under the view title during a refresh, and previously loaded rows stay visible.

### Current project

Lists the 20 most recent builds of the pipeline whose repository URL matches the selected folder's `origin` remote. The pipeline name is shown as the section description.

When no single pipeline matches, the section holds one muted row giving the reason: the folder has no origin remote, no pipeline uses this repository, or `<N> pipelines use this repository`.

Inline buttons: **Refresh** and, when a pipeline matches, **Trigger build**.

### My Pipelines (N)

Lists all accessible pipelines alphabetically, 50 at a time with a **Load more** row. `N` is the total number of accessible pipelines. The pipeline matching the current project has a ★ after its name.

Inline buttons: **Refresh**, **Trigger build** and **Search**. While a search is active, the description reads `“<query>” · <matches> of <total>` and **Search** is replaced by **Clear filter**, which restores the full list.

Expanding a pipeline lists its 20 most recent builds. A pipeline shows a neutral icon until its builds have loaded, then the icon of its latest build's state.

### Build rows

Each build row shows a status icon, `#<number> <first line of message>` (or just `#<number>`), and a description of `<branch or short commit> · <relative time>`. Hovering shows status, branch, commit, author, full message, and absolute start and finish times.

| State | Icon |
| --- | --- |
| passed | green check |
| failed | red cross |
| running | blue animated spinner |
| scheduled, creating, waiting | grey clock |
| blocked | yellow pause |
| canceled, canceling, skipped, not run | grey slash |
| anything else | grey circle |

Click a row to open the build page. The inline button on the row opens the build in Buildkite in your browser.

### Errors

If a request fails for a reason other than authentication, a red row with the error message appears at the top of the tree with an inline **Retry** button. It disappears after a successful refresh.

## Triggering a build

Use **Trigger build** on **My Pipelines** to choose a pipeline, or on **Current project** to skip that step. The quick trigger from **Current project** pre-fills the branch field with the selected folder's current Git branch (editable; empty when HEAD is detached or the branch is unknown).

Both then ask for an optional message and optional environment variables (`KEY=value`, one per line, entered as a password), and show a confirmation with the pipeline, ref, message and masked environment values before creating the build.

## Build page

Clicking a build row opens a build page in one editor tab titled `<pipeline name> #<number>`. Clicking another build reuses the same tab.

The header shows the pipeline name, build number, a coloured status badge, branch, 7-character commit, author, full message, relative start time, and total duration (or `running for <duration>` while unfinished), with **Open in Buildkite** and **Refresh** buttons. Below it, every job is listed with its status icon, name, duration, exit code (when present) and a link that opens the job in Buildkite. A build with no jobs shows "No jobs yet".

While loading, the page shows a loading state. On failure it shows a non-sensitive error message with a **Retry** button.

While the tab is visible and the build is unfinished (anything other than passed, failed, canceled, skipped or not run), the page refreshes every 10 seconds. Polling stops when the build finishes or the tab is hidden, and resumes when the tab is shown again for an unfinished build. The page uses the editor theme's colours and fonts. It closes when you disconnect or change organization.

## Security model

The extension stores the user token exclusively in VS Code `SecretStorage`. Buildkite response data is held only in memory for the current VS Code session. Trigger environment values are masked before confirmation, sent only in the build-creation request, and discarded immediately afterwards. The extension does not create logs, settings, files, terminals, telemetry, or diagnostics containing tokens or trigger environment values.

The build page loads no remote scripts, styles, fonts or images (its content security policy allows only its own nonce-tagged inline script and style) and never receives the token or trigger environment values. The extension opens only `https` links on `buildkite.com` and its subdomains.

## Development

```sh
npm install
npm test
```
