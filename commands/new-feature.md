Create a new feature module. Follow these steps in exact order.

Angular idioms depend on the project version — read `.claude/angular-practices/`
and follow it. **Precedence (see `.claude/rules/project-rules.md` → Precedence):** a valid
project convention wins over the BP profile; the profile applies only where the project
has no convention or is below standard (new code only); legacy modules are never refactored.

## Step 1: Understand Context
- Read `CLAUDE.md` → links to docs below
- Read `.claude/rules/project-rules.md` → naming, structure, Coexistence rules, **Reference Examples**
- Read `docs/ARCHITECTURE.md` → where this feature fits
- Read `docs/API_CONTRACT.md` → which endpoints this feature calls
- Read `docs/DESIGN_SYSTEM.md` → shared components to use
- **Open the Reference Example files** listed in `project-rules.md` (best existing service / page / component / spec) and mirror their style — this is the strongest signal for matching the project's real conventions
- Ask me if anything is unclear before writing code

## Step 2: Create Feature Structure

> **Use the project's actual layout and folder names from `project-rules.md`.**
> The tree below is only the DEFAULT shape — if the project calls things differently
> (e.g. `containers/` instead of `pages/`, `ui/` or `common/` instead of `shared/`,
> an Nx `libs/` layout, or NgModule-based folders), follow the project, not this tree.

```
{features-dir}/{feature-name}/        # e.g. features/, modules/, or an Nx lib
├── {feature}.routes.ts
├── models/
│   └── {feature}.model.ts           # Interfaces mirroring the backend response shape
├── services/
│   └── {feature}.service.ts         # All data-access calls
├── pages/                           # Smart (container) components — project may call these containers/
│   ├── {feature}-list/
│   │   ├── {feature}-list.component.ts
│   │   ├── {feature}-list.component.html
│   │   └── {feature}-list.component.scss
│   └── {feature}-detail/
└── components/                      # Dumb (presentational) components
    └── {feature}-form/
```

## Step 3: Implement in This Order
1. **Model** — interfaces for entity, request/response, mirroring the backend's actual DTOs / response shape (per `project-rules.md` — envelope, raw DTO, or GraphQL type)
2. **Service** — data-access methods returning `Observable<T>` typed with the project's response shape (HttpClient, or the project's client if it uses Apollo/another)
3. **Routes** — lazy-loaded, guard-protected where needed
4. **Page components (smart)** — data, loading/error/empty states
5. **Presentational components (dumb)** — inputs/outputs only, no data access

## Step 4: Write Tests (see /write-tests)
- Service: mock HttpClient, test success + error + empty per method
- Component: mock service, test render + interaction + loading + error states

## Step 5: Rules (from .claude/rules/project-rules.md + .claude/angular-practices/)
- Data access ONLY in services — never in components
- `ChangeDetectionStrategy.OnPush` on every component
- Tear down subscriptions per profile: `takeUntilDestroyed` (v16+) or `takeUntil(destroy$)` + `ngOnDestroy` (v12–15)
- No `any` — interfaces/types for every model and response
- Use the project's forms approach from `project-rules.md` (Reactive Forms by default; Formly / template-driven if that's what the project uses)
- No hardcoded backend URL — use `environment`

## Step 6: Update Documentation
- `docs/API_CONTRACT.md` if you used/discovered endpoints
- Create `CONTEXT.md` inside the feature folder (use /write-context)
- `docs/PROJECT-STATUS.md` (use /update-status)

## Step 7: Verify
- Build passes: `ng build` / `npx tsc --noEmit`
- All tests pass: `ng test` / `jest`
- Lint passes: `ng lint`
- Review with /review-pr before committing
