Scan this Angular project's codebase and fill in the skeleton docs that were
created by the installer. This command runs **one-shot**: scan → ask all open
questions once → write all files → verify → summarize. Reads code and writes
docs only — never modifies application source files.

The skeleton files already exist at their correct locations:
  CLAUDE.md                        ← project root (keep under 200 lines)
  docs/ARCHITECTURE.md
  docs/API_CONTRACT.md
  docs/DESIGN_SYSTEM.md
  docs/PROJECT-STATUS.md
  docs/decisions/
  .claude/rules/project-rules.md   ← auto-loaded every session

The version-matched best-practice file is in `.claude/angular-practices/`
(one file, already matched to this project's Angular version by the installer).

## Core Principles
- **Infer from code first.** Read before asking — do not ask about things you can determine.
- **Batch the questions.** Collect EVERY uncertain point across ALL files and ask them in ONE round (Stage 1). Do not drip-feed questions file by file.
- **Then write everything.** After the answers come back, write all 7 files in one pass (Stage 2) — no per-file stops.
- **Review is at the end.** The human review happens once, after the summary (Stage 4) — not between files.
- **Precedence: codebase first, then the BP profile.** A valid project convention wins over the Angular best-practice profile; the profile applies only where the project has no convention or is objectively below standard (new code only). Legacy is never refactored. Write this exact precedence into `project-rules.md` (the `## Precedence` section).
- **CLAUDE.md stays under 200 lines.** Link to docs/ for details, do not inline everything.

## Stage 0: Scan (read-only, no output yet)
1. Read the BP file in `.claude/angular-practices/` (one file — the version's idioms).
2. Read `package.json` → Angular version, **UI library (auto-detect from dependencies)**, test runner, state libs.
   - **UI library detection**: scan `dependencies` and `devDependencies` for known third-party UI packages. Examples include but are NOT limited to: `primeng`, `@angular/material`, `@angular/cdk`, `ng-zorro-antd`, `@ng-bootstrap/*`, `ngx-bootstrap`, `@clr/angular`, `@progress/kendo-angular-*`, `@ionic/angular`, `@nebular/*`, `element-angular`, `@spike-rabbit/element-angular`, `flowbite-angular`, or any package whose name suggests a UI/design system. **Record all matches** — the project may use more than one. **Do NOT hardcode a fixed list** — infer from what is actually installed.
3. Scan `src/`:
   - Module system: standalone vs NgModule
   - State: NgRx / Signals / BehaviorSubject / plain service
   - Folder layout: `core/ shared/ features/` or other
   - HTTP pattern: HttpClient in services vs components
   - Interceptors, guards, auth flow, token handling
   - Test setup, shared components, UI library usage
   - **Wrapped components detection** (library-agnostic — works for any UI library the project actually uses):
     - Use the UI library list detected from `package.json` in Step 2 (NOT a hardcoded list)
     - Enumerate the project's shared component folder (e.g. `shared/components/`, `ui/`, `common/`, `components/` — record the actual folder name)
     - For each sub-folder, look for:
       - A `*.component.ts` file with a `@Component` decorator
       - A TypeScript `import` statement that matches one of the detected UI library packages
         (e.g. if `primeng` is in deps → look for `from 'primeng/...'`; if `@clr/angular` is in deps → look for `from '@clr/angular'`)
       - A simple `value`/`valueChange` input-output pair suggesting it wraps a single primitive
     - Exclude framework imports from the match list: `@angular/core`, `@angular/common`, `@angular/router`, `@angular/forms`, `@angular/animations`, `@angular/platform-browser*`, `rxjs`, `@ngrx/*`, `zone.js`, `tslib` (these are NOT UI library imports)
   - Record each candidate as `wrapper {name} → library {detected_package}/{imported_module}` for Stage 2 table generation
   - Pick one as "Wrapper Reference Example" (simplest API + most reused) and record the path for `project-rules.md` Reference Examples table
4. **Find the best-example files** — the most complete, idiomatic feature to use as a
   reference template. Pick the best example for each of: a service, a smart/page
   component, a dumb component, a test spec. Verify each path exists.
5. Classify each finding: `standard` / `below-standard` / `uncertain`.
6. Print a short findings summary (3–5 lines) + the chosen best-example files.

## Stage 1: Ask ALL Open Questions at Once
1. Gather every `uncertain` item across ALL seven files into a single list
   (e.g. "both NgRx and Signals present — which is primary?", "response envelope shape?",
   "auth model?", "which forms approach?", "confirm this legacy do-not-touch list").
   - **Wrapper auto-detection**: if wrappers were detected in Stage 0, confirm for each:
     (a) which library component it wraps, (b) custom additions, (c) is it required (BLOCKER) or preferred (SUGGESTION).
     Default if team does not answer: treat as SUGGESTION.
2. Ask them as ONE grouped batch of multiple-choice questions.
3. **WAIT** for the answers. Do not write any file until the batch is answered.
4. If nothing is uncertain, say so and proceed directly to Stage 2.

## Stage 2: Write ALL Files (one pass, no stops)
Using the scan + the answers, write all files in this order. Replace every `{{...}}`
placeholder with real content. Do NOT stop between files.

1. **CLAUDE.md** (root) — `Read first` links, `Common commands` from `package.json` scripts, `Runtime and tooling` from detected stack, `High-level architecture` (2–4 line summary, link to docs/ARCHITECTURE.md). Under 200 lines.
2. **docs/API_CONTRACT.md** — infer from existing `*.service.ts` calls; map endpoints → service methods → TypeScript interfaces. Mark gaps.
3. **docs/ARCHITECTURE.md** — actual layer structure, routing/lazy-loading, state approach, HTTP/interceptor flow, auth strategy. Full detail here (not in CLAUDE.md).
4. **.claude/rules/project-rules.md** — tech stack, naming, coding rules (actionable, not prose). Include the `## Precedence` section, the `## Reference Examples` section (best-example files from Stage 0 — paths that exist only), and the `## Coexistence Strategy` section (see below).
5. **docs/PROJECT-STATUS.md** — snapshot: what exists, in progress, known issues, next tasks. Session counter = 1.
6. **docs/DESIGN_SYSTEM.md** — UI library, design tokens (infer from styles/theme), shared/reusable components in whatever the project calls that folder (record the actual name), AND the **Wrapped Components** table (filled from Stage 0 detection, confirmed in Stage 1). If no wrappers found, OMIT the Wrapped Components section and add: `> This project uses UI library components directly — no shared wrappers.`
7. **docs/decisions/** — one ADR per real decision confirmed (e.g. `001-state-management.md`, `002-auth-token-storage.md`). Only for actual decisions.

### Coexistence Strategy (inside project-rules.md)
- `standard` items → required rules (the project already does this; keep doing it).
- `below-standard` items → correct rule from the BP file, scoped to **new code only**, with note: "Legacy modules keep their style — do NOT refactor unless explicitly asked."
- List the **legacy / do-not-touch modules** (confirmed in the Stage 1 batch).

## Stage 3: Self-Verification (prove the docs work)
1. **Placeholder scan:** no leftover `{{...}}` / `TODO` / `TBD`. Report "0 placeholders left".
2. **Path check:** every file path mentioned (Reference Examples, CLAUDE.md links, ADR pointers) actually exists. Fix any broken path.
3. **Comprehension test:** answer this using ONLY the generated docs —
   > "If I add a new `XyzService` + list page: (a) which folder, (b) which DI/RxJS/Signals idiom, (c) what response shape does the service return, (d) where does the test go and what's it named?"
   If any part can't be answered from the docs, fill the gap.

## Stage 4: Final Summary (always print this last)
Print a summary so I can review everything at once:

**1. What I did** — 2–4 bullet lines (version detected, key conventions captured, legacy modules flagged).

**2. Files changed** — a table:

| File | Status | Key content / decisions captured |
|------|--------|----------------------------------|
| CLAUDE.md | created/updated | ... |
| docs/API_CONTRACT.md | created/updated | ... |
| docs/ARCHITECTURE.md | created/updated | ... |
| .claude/rules/project-rules.md | created/updated | precedence + coexistence + reference examples |
| docs/PROJECT-STATUS.md | created/updated | ... |
| docs/DESIGN_SYSTEM.md | created/updated | ... | + Wrapped Components table (N rows, or omitted if none) |
| docs/decisions/00x-*.md | created | ... |

**3. Questions I asked & your answers** — short list (for the record).

**4. Verification** — placeholders left (should be 0), broken paths (should be 0), comprehension-test answer.

**5. Anything still uncertain / needs your eyes** — gaps, assumptions, endpoints to confirm.

Then: "Review the summary above. Commit when ready:
`git add CLAUDE.md docs/ .claude/rules/ && git commit -m \"docs: init angular-vibe-kit workspace\"`"

## Rules
- Do NOT modify `.ts`, `.html`, `.scss` application files.
- Do NOT add content that is not inferable from the codebase or confirmed in the Stage 1 batch.
- Stage 1 (questions) and Stage 4 (summary + review) are the only interactive points — everything between is one pass.
