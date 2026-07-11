---
name: angular-practices
description: Use when writing, reviewing, or refactoring any Angular / TypeScript code in this project — components, dependency injection, templates, services, HTTP, routing, RxJS/Signals, forms, and testing. Provides the version-matched Angular {{NG_PROFILE_LABEL}} idioms for this codebase.
---

# Angular Practices (this project)

> **Ngôn ngữ:** giải thích/review bằng tiếng Việt; giữ nguyên thuật ngữ kỹ thuật (DI, OnPush, RxJS...)
> và code bằng tiếng Anh.

When you write or review Angular code in this project, follow the version-matched
best-practice profile that the installer selected for this codebase.

**→ Read `.claude/angular-practices/{{PRACTICE_FILE}}` and apply it.**

That file is the source of truth for HOW to write idiomatic Angular {{NG_PROFILE_LABEL}}:
component style (standalone vs NgModule), DI (`inject()` vs constructor), template syntax
(`@if/@for` vs `*ngIf/*ngFor`), thin components with a smart/dumb split, HTTP in services
(not components), typed reactive forms, RxJS teardown (`takeUntilDestroyed`) or Signals for
local state, `OnPush` change detection, and `TestBed` slice tests.

## Precedence — which rule wins (read this first)

The profile is **not** absolute. Follow this order (see `.claude/rules/project-rules.md` → Precedence):

1. **This project's conventions** (the codebase + `.claude/rules/project-rules.md`) — HIGHEST.
   If the project does something consistently and it works, match it — even if it differs
   from the profile (folder layout, naming, state-management library, API/response shape, auth).
2. **This profile** — applies only where the project has NO convention, or where existing
   code is objectively below standard. In that case the standard applies to **NEW code only**.
3. **Legacy modules** (Coexistence Strategy in project-rules.md) — never refactored.

## Before importing a raw UI-library component

Check whether a shared wrapper already exists for the need — see the
**component-wrapper-priority** skill and `docs/DESIGN_SYSTEM.md` → Wrapped Components table.
Never bypass an existing wrapper with a raw library import.
