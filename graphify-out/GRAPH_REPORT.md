# Graph Report - improve-design  (2026-11-19)

## Corpus Check
- 33 files · ~15,820 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 3)

## Summary
- 344 nodes · 617 edges · 19 communities (17 shown, 2 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `67be6352`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Extension Tree Provider
- Buildkite Domain Types
- Package Manifest
- Spec Features
- TypeScript Config
- extension.test.ts
- Intent: Buildkite-style Activity Bar icon
- Intent: Build page webview
- Activity Bar Icon
- Intent: Build rows open the build page
- Intent: Quick trigger from the Current project section
- Intent: Presentation helpers for build status and times
- Intent: Search filter display, progress bar and error row
- Intent: Current project and My Pipelines sections with styled build rows
- Intent: Welcome screens, view subtitle and overflow menu
- presentation.ts
- Intent: Exclude tooling folders from the packaged extension
- build-page.test.ts
- BuildPage

## God Nodes (most connected - your core abstractions)
1. `BuildkiteProvider` - 34 edges
2. `activate()` - 19 edges
3. `renderBuildPage()` - 16 edges
4. `BuildPage` - 15 edges
5. `Build` - 13 edges
6. `BuildkiteClient` - 13 edges
7. `Buildkite VS Code extension spec` - 12 edges
8. `BuildkiteError` - 11 edges
9. `compilerOptions` - 11 edges
10. `Pipeline` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Buildkite for VS Code (README)` --conceptually_related_to--> `Buildkite VS Code extension spec`  [INFERRED]
  README.md → docs/specs/buildkite-vscode-extension.md
- `VS Code SecretStorage` --shares_data_with--> `Token storage and replacement`  [INFERRED]
  README.md → docs/specs/buildkite-vscode-extension.md
- `Security model` --conceptually_related_to--> `Token storage and replacement`  [INFERRED]
  README.md → docs/specs/buildkite-vscode-extension.md
- `Sidebar and build page redesign spec` --references--> `Buildkite VS Code extension spec`  [INFERRED]
  docs/specs/sidebar-and-build-page-redesign.md → docs/specs/buildkite-vscode-extension.md
- `BuildPage` --references--> `Build`  [EXTRACTED]
  src/buildPage.ts → src/buildkite.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Build status display in tree and build page** — docs_specs_sidebar_and_build_page_redesign_status_icons, docs_specs_sidebar_and_build_page_redesign_relative_time, docs_specs_sidebar_and_build_page_redesign_current_project_section, docs_specs_sidebar_and_build_page_redesign_build_page [INFERRED 0.75]
- **Trigger build flow with masked environment values** — docs_specs_buildkite_vscode_extension_trigger_build, docs_specs_buildkite_vscode_extension_env_var_masking, docs_specs_sidebar_and_build_page_redesign_trigger_from_current_project [INFERRED 0.85]

## Communities (19 total, 2 thin omitted)

### Community 0 - "Extension Tree Provider"
Cohesion: 0.10
Nodes (9): BuildkiteClient, activate(), BuildkiteProvider, emptyState(), Node, safeBuild(), safeBuildkiteUrl(), safeJob() (+1 more)

### Community 1 - "Buildkite Domain Types"
Cohesion: 0.13
Nodes (22): Build, BuildkiteError, Job, normalizeRepository(), Organization, Pipeline, pipelineRepository(), BuildPageTarget (+14 more)

### Community 2 - "Package Manifest"
Cohesion: 0.06
Nodes (33): activationEvents, categories, contributes, commands, menus, submenus, views, viewsContainers (+25 more)

### Community 3 - "Spec Features"
Cohesion: 0.12
Nodes (23): Buildkite authorization scope, Auto refresh and manual refresh, Build details and jobs, Current project build list, Environment variable masking, My Pipelines, Organization selection, Origin remote project matching (+15 more)

### Community 4 - "TypeScript Config"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, lib, module, outDir, rootDir, skipLibCheck (+4 more)

### Community 5 - "extension.test.ts"
Cohesion: 0.05
Nodes (27): currentBranch(), execFileAsync, originRemote(), manifest, root, svg, ctx, EventEmitter (+19 more)

### Community 6 - "Intent: Buildkite-style Activity Bar icon"
Cohesion: 0.25
Nodes (7): Affected users and systems, Constraints, Intent: Buildkite-style Activity Bar icon, Open questions, Out of scope, Problem, Proposed outcome

### Community 7 - "Intent: Build page webview"
Cohesion: 0.25
Nodes (7): Affected users and systems, Constraints, Intent: Build page webview, Open questions, Out of scope, Problem, Proposed outcome

### Community 9 - "Intent: Build rows open the build page"
Cohesion: 0.25
Nodes (7): Affected users and systems, Constraints, Intent: Build rows open the build page, Open questions, Out of scope, Problem, Proposed outcome

### Community 10 - "Intent: Quick trigger from the Current project section"
Cohesion: 0.25
Nodes (7): Affected users and systems, Constraints, Intent: Quick trigger from the Current project section, Open questions, Out of scope, Problem, Proposed outcome

### Community 11 - "Intent: Presentation helpers for build status and times"
Cohesion: 0.25
Nodes (7): Affected users and systems, Constraints, Intent: Presentation helpers for build status and times, Open questions, Out of scope, Problem, Proposed outcome

### Community 12 - "Intent: Search filter display, progress bar and error row"
Cohesion: 0.25
Nodes (7): Affected users and systems, Constraints, Intent: Search filter display, progress bar and error row, Open questions, Out of scope, Problem, Proposed outcome

### Community 13 - "Intent: Current project and My Pipelines sections with styled build rows"
Cohesion: 0.25
Nodes (7): Affected users and systems, Constraints, Intent: Current project and My Pipelines sections with styled build rows, Open questions, Out of scope, Problem, Proposed outcome

### Community 14 - "Intent: Welcome screens, view subtitle and overflow menu"
Cohesion: 0.25
Nodes (7): Affected users and systems, Constraints, Intent: Welcome screens, view subtitle and overflow menu, Open questions, Out of scope, Problem, Proposed outcome

### Community 15 - "presentation.ts"
Cohesion: 0.14
Nodes (27): buildPageDocument(), elapsed(), escapeHtml(), GLYPH, icon(), jobRow(), LABEL, POLL_INTERVAL_MS (+19 more)

### Community 16 - "Intent: Exclude tooling folders from the packaged extension"
Cohesion: 0.25
Nodes (7): Affected users and systems, Constraints, Intent: Exclude tooling folders from the packaged extension, Open questions, Out of scope, Problem, Proposed outcome

### Community 17 - "build-page.test.ts"
Cohesion: 0.12
Nodes (7): { BuildPage }, FakePanel, M, panels, passed, running, vscodeMock

## Knowledge Gaps
- **9 isolated node(s):** `@types/node`, `@types/vscode`, `typescript`, `Organization selection`, `Build page 10-second polling` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 172 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BuildkiteProvider` connect `Extension Tree Provider` to `Buildkite Domain Types`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `activate()` (e.g. with `.show()` and `.syncOrganization()`) actually correct?**
  _`activate()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@types/node`, `@types/vscode`, `typescript` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Extension Tree Provider` be split into smaller, more focused modules?**
  _Cohesion score 0.10195035460992907 - nodes in this community are weakly interconnected._
- **Why does `BuildPage` connect `BuildPage` to `Extension Tree Provider`, `Buildkite Domain Types`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Should `Buildkite Domain Types` be split into smaller, more focused modules?**
  _Cohesion score 0.13445378151260504 - nodes in this community are weakly interconnected._
- **Why does `Build` connect `Buildkite Domain Types` to `Extension Tree Provider`, `build-page.test.ts`, `BuildPage`, `presentation.ts`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._