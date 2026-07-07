Create a new feature module — **code only**. This command writes the code: folder structure,
model, service, routes, page components, presentational components. It does **NOT** write tests,
does **NOT** update `docs/api-contracts/`, `docs/PROJECT-STATUS.md`, or `CONTEXT.md`, and does
**NOT** run review. Those are separate, manually-invoked commands — they're decoupled so each one
runs at the right moment:

- `/write-tests` after the code builds (not before — broken code wastes a test pass)
- `/write-context` when you're ready to snapshot the module
- `/update-status` at end of session, not mid-feature
- `/review-pr` before committing

If you want the **full gated pipeline** (scaffold → implement → test → review → wrap-up in one
orchestrated run with phase gates), use **`/dev-cycle`** instead. **Use `/new-feature` when you
want the code alone and intend to drive tests/docs/review yourself.**

Angular idioms depend on the project version — read `.claude/angular-practices/` and follow it.
**Precedence (see `.claude/rules/project-rules.md` → Precedence):** a valid project convention
wins over the BP profile; the profile applies only where the project has no convention or is below
standard (new code only); legacy modules are never refactored.

## Step 1: Understand Context
- Read `CLAUDE.md` → links to docs below
- Read `.claude/rules/project-rules.md` → naming, structure, Coexistence rules, **Reference Examples**
- Read `docs/ARCHITECTURE.md` → where this feature fits
- Read `docs/api-contracts/README.md` (shared Base URL/envelope/auth) and `docs/api-contracts/{feature}.md` if it already exists → which endpoints this feature calls
- Read `docs/DESIGN_SYSTEM.md` → shared components to use, **AND the Wrapped Components table → which wrapper to use for each UI library primitive** (e.g. for a dropdown, use `<app-select>` not `p-dropdown`)
- Check `docs/plans/` → **if a plan for this feature exists** (written by `/plan`), it is the source
  of truth for scope, File Map, and task Interfaces — follow it for Steps 2 and 3. If the feature is
  large and no plan exists, suggest running `/plan` first, then continue if I want to.
- **Open the Reference Example files** listed in `project-rules.md` (best existing service / page /
    component / spec) and mirror their style — this is the strongest signal for matching the project's real conventions
- Ask me if anything is unclear before writing code

## Step 2: Create Feature Structure
If a plan was found in Step 1, create exactly the files in its File Map. Otherwise follow
`.claude/references/feature-structure.md` → Folder Structure. **Always use the project's
actual layout and folder names from `project-rules.md`** — the reference file's tree is only the
default shape (e.g. the project may use `containers/` instead of `pages/`, an Nx `libs/` layout, etc.).

## Step 3: Implement
Follow `.claude/references/feature-structure.md` for both **Implementation Order** (Model → Service →
Routes → Page components → Presentational components) and **Coding Rules** (data access in services
only, `OnPush`, subscription teardown, no `any`, project's forms approach, no hardcoded URLs, wrapper
priority) — apply the rules AS you write each piece, not as an afterthought. If a plan was found, use
the exact model/DTO shapes and service signatures from its tasks' `Interfaces` blocks.

## Step 4: Handoff (print this exact block, then stop)
After the code is written, print a single block — DO NOT do any of the following; the user triggers
them as separate commands at the right moments:

```
✅ new-feature: code written
   - Files created  : <list>
   - Plan followed  : <yes — docs/plans/<file>.md | no — defaults from feature-structure.md>

These are out of scope here. Run them at the right moment:
   - Tests         → /write-tests <feature>          (run when the code compiles)
   - Context       → /write-context <feature>       (run when you're ready to snapshot the module)
   - API contracts → /write-api-contracts <feature>  (run if endpoints changed)
   - Status        → /update-status                  (end of session, not mid-feature)
   - Review        → /review-pr                      (before committing)

   Or hand the rest off to the orchestrator:
   - Full pipeline → /dev-cycle                     (scaffold → implement → test → review → wrap-up,
                                                       gated — preferred for features larger than 1 file)
```

Then WAIT for the user.

## Rules
- This command **only writes code** in `src/`. It never touches `docs/`, `tests/`, or `package.json`.
- Do not write `.spec.ts` files here — `/write-tests` owns them.
- Do not edit `docs/PROJECT-STATUS.md`, `docs/api-contracts/`, or `CONTEXT.md` here — those commands own them.
- If the user asks to bundle tests or review into this same run, point them at `/dev-cycle`.
