# Angular Plan Spec (shared source of truth)

> Read by `/plan` (writes the plan) and by `/dev-cycle` + `/new-feature` (consume the plan).
> Keep the plan format HERE only — the commands are thin wrappers around this file.
> Adapted from [obra/superpowers](https://github.com/obra/superpowers) `writing-plans` (MIT).

A plan is written for an engineer with **zero context for this codebase**: every task names exact
files, exact types, and exact signatures. If a step changes code, the step shows the code.

## Where plans live

`docs/plans/YYYY-MM-DD-<feature-name>.md` — one plan per feature. Create `docs/plans/` if it
doesn't exist yet.

## Plan document header (required)

```markdown
# <Feature Name> — Implementation Plan

**Goal:** <one sentence: what this builds and for whom>

**Architecture:** <2-3 sentences: approach, where it sits in the app, key data flow>

**Approach chosen:** <the approach the user approved in /plan Phase C, one line, with the
main alternative that was rejected and why>

## Global Constraints

Do NOT restate project rules here — point at the sources every task implicitly obeys:

- Precedence + naming + Coexistence: `.claude/rules/project-rules.md`
- Version idioms (DI, control flow, Signals/RxJS): `.claude/angular-practices/<version>.md`
- Folder shape, implementation order, coding rules: `.claude/references/feature-structure.md`
- Wrapper priority: `docs/DESIGN_SYSTEM.md` → Wrapped Components table
- Endpoints + payload shapes: `docs/api-contracts/<feature>.md` (shared envelope/auth: `docs/api-contracts/README.md`)

<Then list ONLY feature-specific constraints the user stated, one line each, verbatim —
e.g. "must work offline", "max 1 request per keystroke", "reuse OrderService pagination".>
```

## File map (required, before any task)

Lock decomposition in before writing tasks. Use the **project's actual layout** from
`project-rules.md` (e.g. `containers/` not `pages/`, Nx `libs/`) — never the default tree blindly.

```markdown
## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | src/app/features/<feature>/models/<feature>.model.ts | DTOs mirroring docs/api-contracts/<feature>.md |
| Create | src/app/features/<feature>/services/<feature>.service.ts | Data access only |
| Modify | src/app/app.routes.ts | Register lazy route |
| Test   | src/app/features/<feature>/services/<feature>.service.spec.ts | Per test-spec.md |
```

One clear responsibility per file. Files that change together live together.

## Task structure

Order tasks by the Implementation Order in `feature-structure.md`:
**Model → Service → Routes → Page components → Presentational components → Tests**
(tests follow `.claude/references/test-spec.md`; this kit does not use red/green TDD ordering).

Each task uses this shape:

````markdown
### Task N: <name>

**Files:**
- Create: `exact/path/file.ts`
- Modify: `exact/path/existing.ts` (what changes)
- Test: `exact/path/file.spec.ts`

**Interfaces:**
- Consumes: <what this task uses from earlier tasks — exact type names and signatures>
- Produces: <what later tasks rely on — exact function names, parameter and return types.
  A task's implementer may see only their own task; this block is how they learn the
  names and types neighboring tasks use.>

**Steps:**
- [ ] Step 1: <one action, 2-10 minutes, with the actual code block if it changes code>
- [ ] Step 2: <verify — exact command and expected output, e.g. `npx tsc --noEmit` → clean>
````

Task sizing: the smallest unit that is independently verifiable (compiles / tests pass on its
own). Fold setup, config, and docs steps into the task whose deliverable needs them.

## No placeholders (plan failures — never write these)

- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate error handling" / "add validation" / "handle edge cases" (show the handling)
- "Write tests for the above" without naming the cases (list them per test-spec.md coverage)
- "Similar to Task N" — repeat the code; tasks may be read out of order
- A step that describes what to do without showing how (code steps require code blocks)
- References to types, functions, or methods not defined in any task and not existing in the codebase

## Self-review (run after writing, fix inline — no re-review needed)

1. **Requirement coverage** — for each requirement the user confirmed in `/plan`, point to the
   task that implements it. A requirement with no task = add the task.
2. **Placeholder scan** — search the plan for every pattern in the list above.
3. **Type consistency** — types, signatures, and property names used in later tasks match what
   earlier tasks define, AND match the shapes in `docs/api-contracts/<feature>.md`.
4. **Wrapper check** — every UI element in the plan uses the wrapper from the Wrapped
   Components table when one exists (a raw library import where a wrapper exists is a plan bug).
5. **Layout check** — every path in the File Map matches the project's real folder layout from
   `project-rules.md`.

## Output

Report the plan file path, the number of tasks, and the self-review result (what was fixed).
