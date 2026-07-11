---
name: component-wrapper-priority
description: Use before importing a raw UI-library component (p-dropdown, mat-select, nz-*, ng-bootstrap, etc.) when implementing or reviewing a feature — enforces using this project's shared wrapper components from docs/DESIGN_SYSTEM.md instead of bypassing them with a direct library import.
---

# Component Wrapper Priority

> **Ngôn ngữ:** cảnh báo (⚠️) và giải thích cho user viết bằng tiếng Việt; giữ nguyên tên component/thư viện.

Before you write a template or import that uses a UI-library component directly, check whether
the project already has a **shared wrapper** for that need. Bypassing an existing wrapper with a
raw library import is a defect, not a shortcut.

## Decision tree

1. **Open `docs/DESIGN_SYSTEM.md` → the Wrapped Components table.**
2. **A wrapper exists for the need? → USE IT.** Never bypass:
   - Select / dropdown → use the project wrapper (e.g. `<app-select>`), not raw `p-dropdown` / `mat-select` / `nz-select`.
   - Date input → use the wrapper (e.g. `<app-date-picker>`), not raw `p-calendar` / `mat-datepicker`.
   - Dialog / modal, table, form field, button — use the wrapper if one is listed, not the raw library component.
   - Shared UI states (spinner, empty, error) → use the shared component, don't re-implement inline.
3. **No wrapper exists? → use the library component directly AND log a warning:**
   ```
   > ⚠️ No shared wrapper for <X> — using the library directly. Consider adding one to shared/components/.
   ```
4. **Unsure whether one exists? → ASK** the team before writing the code
   (search the project's wrapper folder — `shared/components/`, `ui/`, `common/` — first).

## Priority order (must follow)

1. **Wrapper in `shared/components/`** (or the folder recorded in DESIGN_SYSTEM.md) — ALWAYS use it when one exists.
2. **Library component direct** — only when no wrapper exists; import the library type + log the warning above.
3. **Custom build from scratch** — only when the library has no equivalent.

## Enforcement

This rule is enforced by `/review-pr` and the `angular-reviewer` agent: a raw library import when a
wrapper exists, in **new code**, is a 🔴 BLOCKER. Legacy modules (see Coexistence Strategy in
`.claude/rules/project-rules.md`) are exempt — do not refactor them just to satisfy this rule.
Works for any UI library — PrimeNG, Angular Material, ng-zorro, ng-bootstrap, or custom.
