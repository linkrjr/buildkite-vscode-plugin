# Graph Report - improve-design  (2026-11-18)

## Corpus Check
- 24 files · ~10,337 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 3)

## Summary
- 249 nodes · 387 edges · 19 communities (17 shown, 2 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b4486882`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Extension Tree Provider
- Buildkite Domain Types
- Package Manifest
- Spec Features
- TypeScript Config
- VS Code Contributions
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
- BuildkiteClient
- activity-bar-icon.test.ts

## God Nodes (most connected - your core abstractions)
1. `BuildkiteProvider` - 32 edges
2. `activate()` - 14 edges
3. `BuildkiteClient` - 12 edges
4. `Buildkite VS Code extension spec` - 12 edges
5. `compilerOptions` - 11 edges
6. `Pipeline` - 8 edges
7. `Build` - 8 edges
8. `BuildkiteError` - 8 edges
9. `contributes` - 7 edges
10. `Intent: Buildkite-style Activity Bar icon` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Buildkite for VS Code (README)` --conceptually_related_to--> `Buildkite VS Code extension spec`  [INFERRED]
  README.md → docs/specs/buildkite-vscode-extension.md
- `VS Code SecretStorage` --shares_data_with--> `Token storage and replacement`  [INFERRED]
  README.md → docs/specs/buildkite-vscode-extension.md
- `Security model` --conceptually_related_to--> `Token storage and replacement`  [INFERRED]
  README.md → docs/specs/buildkite-vscode-extension.md
- `Sidebar and build page redesign spec` --references--> `Buildkite VS Code extension spec`  [INFERRED]
  docs/specs/sidebar-and-build-page-redesign.md → docs/specs/buildkite-vscode-extension.md
- `Build page editor tab` --conceptually_related_to--> `Build details and jobs`  [INFERRED]
  docs/specs/sidebar-and-build-page-redesign.md → docs/specs/buildkite-vscode-extension.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Build status display in tree and build page** — docs_specs_sidebar_and_build_page_redesign_status_icons, docs_specs_sidebar_and_build_page_redesign_relative_time, docs_specs_sidebar_and_build_page_redesign_current_project_section, docs_specs_sidebar_and_build_page_redesign_build_page [INFERRED 0.75]
- **Trigger build flow with masked environment values** — docs_specs_buildkite_vscode_extension_trigger_build, docs_specs_buildkite_vscode_extension_env_var_masking, docs_specs_sidebar_and_build_page_redesign_trigger_from_current_project [INFERRED 0.85]

## Communities (19 total, 2 thin omitted)

### Community 0 - "Extension Tree Provider"
Cohesion: 0.17
Nodes (3): activate(), BuildkiteProvider, Node

### Community 1 - "Buildkite Domain Types"
Cohesion: 0.10
Nodes (22): Build, BuildkiteError, Job, normalizeRepository(), Organization, Pipeline, pipelineRepository(), BuildTarget (+14 more)

### Community 2 - "Package Manifest"
Cohesion: 0.10
Nodes (20): activationEvents, categories, description, devDependencies, @types/node, @types/vscode, typescript, displayName (+12 more)

### Community 3 - "Spec Features"
Cohesion: 0.12
Nodes (23): Buildkite authorization scope, Auto refresh and manual refresh, Build details and jobs, Current project build list, Environment variable masking, My Pipelines, Organization selection, Origin remote project matching (+15 more)

### Community 4 - "TypeScript Config"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, lib, module, outDir, rootDir, skipLibCheck (+4 more)

### Community 5 - "VS Code Contributions"
Cohesion: 0.15
Nodes (13): contributes, commands, menus, submenus, views, viewsContainers, viewsWelcome, buildkite.titleActions (+5 more)

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
Cohesion: 0.23
Nodes (14): absoluteTime(), buildDescription(), buildLabel(), BuildLike, buildTooltip(), escapeMarkdown(), FINISHED, firstLine() (+6 more)

### Community 16 - "Intent: Exclude tooling folders from the packaged extension"
Cohesion: 0.25
Nodes (7): Affected users and systems, Constraints, Intent: Exclude tooling folders from the packaged extension, Open questions, Out of scope, Problem, Proposed outcome

### Community 18 - "activity-bar-icon.test.ts"
Cohesion: 0.21
Nodes (5): manifest, root, svg, ids, pkg

## Knowledge Gaps
- **9 isolated node(s):** `@types/node`, `@types/vscode`, `typescript`, `Organization selection`, `Build page 10-second polling` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 128 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BuildkiteProvider` connect `Extension Tree Provider` to `Buildkite Domain Types`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Buildkite VS Code extension spec` (e.g. with `Sidebar and build page redesign spec` and `Buildkite for VS Code (README)`) actually correct?**
  _`Buildkite VS Code extension spec` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@types/node`, `@types/vscode`, `typescript` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Buildkite Domain Types` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Why does `BuildkiteClient` connect `BuildkiteClient` to `Extension Tree Provider`, `Buildkite Domain Types`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Should `Package Manifest` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Why does `Build` connect `Buildkite Domain Types` to `presentation.ts`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._