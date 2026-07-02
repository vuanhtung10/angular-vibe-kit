# Angular Review Checklist (shared source of truth)

> Read by BOTH `/review-pr` (command, runs inline) and the `angular-reviewer` agent (isolated context).
> Keep review logic HERE only — the command and the agent are thin wrappers around this file.

## Load the project's standards first
- `.claude/angular-practices/*.md` — the version-matched idioms (DI, control flow, RxJS/Signals, tests).
- `.claude/rules/project-rules.md` — naming, folder layout, Precedence, Coexistence.
- `docs/DESIGN_SYSTEM.md` → Wrapped Components — the project's shared UI wrappers.

## Precedence (do not over-flag)
A valid project convention WINS over the best-practice profile. Flag a profile deviation as a blocker
only when it's an **objective defect in NEW code**. Do NOT flag legacy modules listed in the Coexistence
Strategy — they are kept as-is. Do NOT flag a valid project choice (naming, structure, state library,
response shape) just because it differs from the profile. When unsure if something is a defect or a
valid choice, say so rather than blocking.

## Review dimensions

### 1. Architecture
- [ ] Smart / dumb separation: pages own data; presentational components only render + emit
- [ ] HTTP calls ONLY in services — never in components
- [ ] No business logic in templates
- [ ] Feature routes are lazy-loaded

### 2. Type Safety
- [ ] No `any` — interfaces/types for every model and API response
- [ ] Responses typed with the project's response shape recorded in `project-rules.md` (envelope, raw DTO, GraphQL type — whatever the backend returns)
- [ ] No `@ts-ignore` / `@ts-expect-error`

### 3. Dependency Injection (per `.claude/angular-practices/`)
- [ ] DI matches the profile: `inject()` (v16+) or constructor injection (v12–15) — consistent across the project
- [ ] Services `@Injectable({ providedIn: 'root' })` unless intentionally scoped

### 4. Reactive / RxJS / Signals (per `.claude/angular-practices/`)
- [ ] Subscriptions torn down: `takeUntilDestroyed` (v16+) or `takeUntil(destroy$)` + `ngOnDestroy` (v12–15)
- [ ] `async` pipe preferred over manual subscribe
- [ ] No `toPromise()` — use `firstValueFrom()` if needed
- [ ] Services return `Observable<T>` — do NOT subscribe internally
- [ ] Signals used per profile: stable for state (v16+); derived state via `computed()`. `resource`/`httpResource` are experimental (v19+) — only if the team opted in

### 5. Error Handling
- [ ] Loading / error / empty states handled in list & detail pages
- [ ] HTTP errors surfaced to the user (not swallowed)
- [ ] Auth errors (e.g. 401) handled centrally by an interceptor — not per-feature

### 6. Security
- [ ] Auth handled per the project's model in `project-rules.md` (token in memory / httpOnly cookie / session / OAuth) and consistent with it. If tokens are used, they are NOT in localStorage
- [ ] No hardcoded backend URL — uses `environment`
- [ ] Routes needing auth are guarded
- [ ] No unsanitized HTML (`innerHTML` / `bypassSecurityTrust*`) without a clear, reviewed reason

### 7. Performance
- [ ] `ChangeDetectionStrategy.OnPush` on every component (or zoneless on v20+ if enabled)
- [ ] List tracking present: `@for` with `track` (v17+) or `*ngFor` with `trackBy` (v12–16)

### 8. Code Quality
- [ ] Component file < ~300 lines; method < ~50 lines
- [ ] No dead code, no `console.log`
- [ ] Naming follows `.claude/rules/project-rules.md`

### 9. Component Wrapping (per `docs/DESIGN_SYSTEM.md` → Wrapped Components)
- [ ] No feature imports a raw UI-library component (`p-dropdown`, `mat-form-field`, `nz-input`, etc.) when a wrapper exists in `shared/components/`
- [ ] UI-primitive imports go through the project's wrapper (import path matches the wrapper's location)
- [ ] Wrapper exists but the PR uses the library directly → 🔴 BLOCKER
- [ ] No wrapper exists and the library is used directly → 🟡 SUGGESTION: "Consider a wrapper in `shared/components/`"
- [ ] New components do NOT silently re-implement logic an existing wrapper already provides
- [ ] A brand-new wrapper follows the Wrapper Reference Example from `project-rules.md`

### 10. Documentation
- [ ] New feature: `CONTEXT.md` created inside the feature folder
- [ ] Logic changed: `CONTEXT.md` Refactor Log updated (append only)
- [ ] Endpoint changed: `docs/API_CONTRACT.md` updated
- [ ] `docs/PROJECT-STATUS.md` updated

## Output format
```
🔴 Blockers — must fix before merge
  - <file:line> — <issue> → <fix>
🟡 Suggestions — improve but not blocking
  - <file:line> — <issue>
💭 Nits — optional polish (naming, minor style not handled by the linter)
  - <file:line> — <note>
🟢 Good — clean patterns / clever solutions worth calling out
  - <note>
```
If there are no blockers, say so explicitly. Cite `file:line`. Explain the "why" behind each finding
and suggest rather than demand.
