# Feature Structure & Coding Rules (shared source of truth)

> Read by BOTH `/new-feature` (linear command) and `/dev-cycle` (gated orchestrator) when scaffolding
> and implementing a new feature module. Keep the folder shape, build order, and coding rules HERE
> only — the two commands differ in pacing (linear vs gated), not in what "correct" looks like.

## Folder structure
> **Use the project's actual layout and folder names from `.claude/rules/project-rules.md`.**
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

## Implementation order
1. **Model** — interfaces for entity, request/response, mirroring the backend's actual DTOs / response shape (per `project-rules.md` — envelope, raw DTO, or GraphQL type)
2. **Service** — data-access methods returning `Observable<T>` typed with the project's response shape (HttpClient, or the project's client if it uses Apollo/another)
3. **Routes** — lazy-loaded, guard-protected where needed
4. **Page components (smart)** — data, loading/error/empty states
5. **Presentational components (dumb)** — inputs/outputs only, no data access

## Coding rules (from `.claude/rules/project-rules.md` + `.claude/angular-practices/`)
- Data access ONLY in services — never in components
- `ChangeDetectionStrategy.OnPush` on every component
- Tear down subscriptions per profile: `takeUntilDestroyed` (v16+) or `takeUntil(destroy$)` + `ngOnDestroy` (v12–15)
- No `any` — interfaces/types for every model and response
- Use the project's forms approach from `project-rules.md` (Reactive Forms by default; Formly / template-driven if that's what the project uses)
- No hardcoded backend URL — use `environment`
- **Wrapper priority**: import from `@shared/components/<name>` (or the project's wrapper folder) if a wrapper exists; never import the library component directly. See `docs/DESIGN_SYSTEM.md` → Wrapped Components.
