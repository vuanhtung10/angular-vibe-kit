Review the code changes in this PR. Check every item — flag violations clearly.

Read `.claude/angular-practices/` for version-correct idioms, and
`.claude/rules/project-rules.md` for project-specific rules.

**Precedence (see `project-rules.md` → Precedence):** a valid project convention wins over
the BP profile; flag a BP deviation as a blocker only when it's an objective defect in NEW
code. Do NOT flag legacy modules listed in the Coexistence Strategy — they are kept as-is.
Do NOT flag a valid project choice (naming, structure, state lib, response shape) just
because it differs from the profile.

## Architecture
- [ ] Smart / dumb separation: pages own data; presentational components only render + emit
- [ ] HTTP calls ONLY in services — never in components
- [ ] No business logic in templates
- [ ] Feature routes are lazy-loaded

## Type Safety
- [ ] No `any` — interfaces/types for every model and API response
- [ ] Responses typed with the project's response shape recorded in `project-rules.md` (e.g. an `ApiResponse<T>` envelope, a raw DTO, or a GraphQL type — whatever the backend actually returns)
- [ ] No `@ts-ignore` / `@ts-expect-error`

## Dependency Injection (follow `.claude/angular-practices/`)
- [ ] DI matches the profile: `inject()` (v16+) or constructor injection (v12–15) — consistent across the project
- [ ] Services `@Injectable({ providedIn: 'root' })`

## Reactive / RxJS / Signals (follow `.claude/angular-practices/`)
- [ ] Subscriptions torn down: `takeUntilDestroyed` (v16+) or `takeUntil(destroy$)` + `ngOnDestroy` (v12–15)
- [ ] `async` pipe preferred over manual subscribe
- [ ] No `toPromise()` — use `firstValueFrom()` if needed
- [ ] Services return `Observable<T>` — do NOT subscribe internally
- [ ] Signals used per profile: stable for state (v16+); derived state via `computed()`. `resource`/`httpResource` are experimental (v19+) — only if the team opted in

## Error Handling
- [ ] Loading / error / empty states handled in list/detail pages
- [ ] HTTP errors surfaced to user (not swallowed)
- [ ] Auth errors (e.g. 401) handled centrally by an interceptor — not per-feature

## Security
- [ ] Auth handled per the project's model in `project-rules.md` (token in memory / httpOnly cookie / session / OAuth) — and consistent with it. If tokens are used, they are NOT in localStorage
- [ ] No hardcoded backend URL — uses `environment`
- [ ] Routes needing auth are guarded
- [ ] No unsanitized HTML (`innerHTML` / `bypassSecurityTrust*`) without a clear, reviewed reason

## Performance
- [ ] `ChangeDetectionStrategy.OnPush` on every component (or zoneless on v20+ if enabled)
- [ ] List tracking present: `@for` with `track` (v17+) or `*ngFor` with `trackBy` (v12–16)

## Code Quality
- [ ] Component file < ~300 lines; method < ~50 lines
- [ ] No dead code, no `console.log`
- [ ] Naming follows `.claude/rules/project-rules.md`

## Documentation
- [ ] New feature: `CONTEXT.md` created inside feature folder
- [ ] Logic changed: `CONTEXT.md` Refactor Log updated (append only)
- [ ] Endpoint changed: `docs/API_CONTRACT.md` updated
- [ ] `docs/PROJECT-STATUS.md` updated

## Summary
1. **Blockers** 🔴 — must fix before merge
2. **Suggestions** 🟡 — improve but not blocking
3. **Good parts** 🟢 — what was done well
