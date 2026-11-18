# Graph Report - improve-design  (2026-11-18)

## Corpus Check
- Corpus is ~6,049 words - fits in a single context window. You may not need a graph.

## Summary
- 141 nodes · 250 edges · 9 communities (7 shown, 2 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.85)
- Token cost: 72,969 input · 0 output

## Community Hubs (Navigation)
- Extension Tree Provider
- Buildkite Domain Types
- Package Manifest
- Spec Features
- TypeScript Config
- VS Code Contributions
- Buildkite API Client
- Security And Redesign Concepts
- Activity Bar Icon

## God Nodes (most connected - your core abstractions)
1. `BuildkiteProvider` - 31 edges
2. `activate()` - 14 edges
3. `BuildkiteClient` - 12 edges
4. `Buildkite VS Code extension spec` - 12 edges
5. `compilerOptions` - 11 edges
6. `Pipeline` - 8 edges
7. `Build` - 7 edges
8. `contributes` - 6 edges
9. `BuildkiteError` - 6 edges
10. `Node` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Buildkite for VS Code (README)` --conceptually_related_to--> `Buildkite VS Code extension spec`  [INFERRED]
  README.md → docs/specs/buildkite-vscode-extension.md
- `Security model` --conceptually_related_to--> `Token storage and replacement`  [INFERRED]
  README.md → docs/specs/buildkite-vscode-extension.md
- `VS Code SecretStorage` --shares_data_with--> `Token storage and replacement`  [INFERRED]
  README.md → docs/specs/buildkite-vscode-extension.md
- `Sidebar and build page redesign spec` --references--> `Buildkite VS Code extension spec`  [INFERRED]
  docs/specs/sidebar-and-build-page-redesign.md → docs/specs/buildkite-vscode-extension.md
- `Welcome screens` --references--> `Token storage and replacement`  [INFERRED]
  docs/specs/sidebar-and-build-page-redesign.md → docs/specs/buildkite-vscode-extension.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Build status display in tree and build page** — docs_specs_sidebar_and_build_page_redesign_status_icons, docs_specs_sidebar_and_build_page_redesign_relative_time, docs_specs_sidebar_and_build_page_redesign_current_project_section, docs_specs_sidebar_and_build_page_redesign_build_page [INFERRED 0.75]
- **Trigger build flow with masked environment values** — docs_specs_buildkite_vscode_extension_trigger_build, docs_specs_buildkite_vscode_extension_env_var_masking, docs_specs_sidebar_and_build_page_redesign_trigger_from_current_project [INFERRED 0.85]

## Communities (9 total, 2 thin omitted)

### Community 0 - "Extension Tree Provider"
Cohesion: 0.15
Nodes (5): activate(), BuildkiteProvider, duration(), Node, safeBuild()

### Community 1 - "Buildkite Domain Types"
Cohesion: 0.11
Nodes (16): Build, BuildkiteError, Job, normalizeRepository(), Organization, Pipeline, pipelineRepository(), BuildTarget (+8 more)

### Community 2 - "Package Manifest"
Cohesion: 0.10
Nodes (20): activationEvents, categories, description, devDependencies, @types/node, @types/vscode, typescript, displayName (+12 more)

### Community 3 - "Spec Features"
Cohesion: 0.16
Nodes (19): Buildkite authorization scope, Auto refresh and manual refresh, Build details and jobs, Current project build list, Environment variable masking, My Pipelines, Organization selection, Origin remote project matching (+11 more)

### Community 4 - "TypeScript Config"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, lib, module, outDir, rootDir, skipLibCheck (+4 more)

### Community 5 - "VS Code Contributions"
Cohesion: 0.18
Nodes (11): contributes, commands, menus, submenus, views, viewsContainers, buildkite.titleActions, view/item/context (+3 more)

### Community 7 - "Security And Redesign Concepts"
Cohesion: 0.50
Nodes (4): Token storage and replacement, Error row with Retry, Welcome screens, VS Code SecretStorage

## Knowledge Gaps
- **9 isolated node(s):** `@types/node`, `@types/vscode`, `typescript`, `Buildkite for VS Code (README)`, `Organization selection` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 55 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BuildkiteProvider` connect `Extension Tree Provider` to `Buildkite Domain Types`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Buildkite VS Code extension spec` (e.g. with `Sidebar and build page redesign spec` and `Buildkite for VS Code (README)`) actually correct?**
  _`Buildkite VS Code extension spec` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@types/node`, `@types/vscode`, `typescript` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Buildkite Domain Types` be split into smaller, more focused modules?**
  _Cohesion score 0.11264367816091954 - nodes in this community are weakly interconnected._
- **Why does `BuildkiteClient` connect `Buildkite API Client` to `Extension Tree Provider`, `Buildkite Domain Types`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Should `Package Manifest` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Why does `contributes` connect `VS Code Contributions` to `Package Manifest`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._