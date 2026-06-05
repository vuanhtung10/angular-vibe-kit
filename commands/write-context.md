Write a `CONTEXT.md` file for the current feature module.

This file is a **snapshot** — it captures WHY this module was built this way,
at the time it was built. It helps future developers (and AI) understand decisions
without guessing from code.

## Where to Create
Place the file inside the feature folder, using the project's actual layout from
`project-rules.md` (the `features/` path below is only the default example):
```
{features-dir}/{feature-name}/CONTEXT.md    # e.g. features/, modules/, or an Nx lib
```

## Template — Fill Every Section

```markdown
# {Feature Name} — Implementation Context
> Written: {YYYY-MM-DD} | Author: {who built it}

## Business Context
Why does this module exist? What user/business problem does it solve?
(2-3 sentences max)

## Components
- `{Feature}ListPage` — smart component: fetches data, pagination, handles loading/error/empty
- `{Feature}DetailPage` — smart component: create/edit form (per the project's forms approach), submit
- `{Feature}FormComponent` — dumb component: receives form/inputs, emits events
- `{Feature}CardComponent` — dumb component: renders one item

## Service
`{Feature}Service` — all HTTP calls to `{base endpoint}`

## State Management
Which approach and WHY (Signals / NgRx / BehaviorSubject / plain service).
Note what is local component state vs shared state.

## API Endpoints Used
- GET    {path}?page=&size=   → paginated list
- GET    {path}/:id           → single
- POST   {path}               → create
- PUT    {path}/:id           → update
- DELETE {path}/:id           → delete

## Technical Decisions
- **{Decision}**: {reason}
- **{Decision}**: {reason}

## Component Wrapping Decisions
- **Wrapped components used**: list the `<app-*>` components used by this feature (e.g. `<app-select>`, `<app-data-table>`)
- **Library components used directly**: list any direct library imports and the reason (e.g. `p-tree` used directly because no wrapper exists yet, and creating one is out of scope for this feature)
- **New wrappers introduced**: if this feature adds a new wrapper to `shared/components/`, list it here and link to the PR/ADR
- **Wrappers NOT used (with reason)**: if a wrapper exists for the need but you chose not to use it, document why (e.g. "wrapper doesn't support X yet — track in #123")

## Considered and Rejected
- **{Option}**: rejected because {reason}

## Dependencies
- Depends on: {other modules/services this uses}
- Depended by: {modules that use this}

## Known Limitations
- ⚠️ {limitation — explain why it's acceptable for now}

## Refactor Log
(Add entries here when significant changes are made. Do NOT edit sections above.)

### {YYYY-MM-DD} | {author}
- {what changed and why}
```

## Rules
1. Write in clear language
2. Be specific — "chose Signals because state is local to this page", not just "chose Signals"
3. Keep each section concise (2-5 bullet points max)
4. "Known Limitations" is critical — prevents future devs from "fixing" intentional trade-offs
5. NEVER edit old content — only ADD new entries in the Refactor Log
6. Write it NOW while context is fresh — tomorrow you'll forget half the reasons
