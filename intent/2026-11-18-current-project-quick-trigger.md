---
title: Quick trigger from the Current project section
status: done
created-at: 2026-11-18
---

# Intent: Quick trigger from the Current project section

Author: Ronaldo Gomes. Status: done

## Problem

Triggering a build of the open project always requires choosing the pipeline and typing the branch.

## Proposed outcome

- AC8 (Trigger part): The Current project section has inline Refresh and Trigger build buttons when a pipeline matches, and only Refresh otherwise.
- AC9: Trigger build from the Current project section skips pipeline selection, pre-fills the branch field with the selected folder's current Git branch (editable, empty if detached or unknown), and then follows the existing message, environment-variable and masked-confirmation steps unchanged.

## Affected users and systems

Developers triggering builds. Git helper (current branch), trigger flow, package.json menus.

## Constraints

Spec: docs/specs/sidebar-and-build-page-redesign.md (read the Detailed behaviour and Business rules sections). Tech stack unchanged: TypeScript, VS Code extension API, tsc, node:test, npm; no new runtime dependencies. Token and trigger environment values must never appear in UI, tooltips, messages or the build page. Depends on T4. Read the branch with git (e.g. 'git -C <folder> symbolic-ref --short HEAD' via execFile, timeout, no shell); detached/failed → empty. Reuse the existing trigger flow with a preset pipeline; do not duplicate the message/env/confirmation steps. Env values still masked and discarded.

## Out of scope

The My Pipelines trigger flow (unchanged).

## Open questions

None
