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
- Read `docs/DESIGN_SYSTEM.md` → shared components to use, **AND the Wrapped Components table → which wrapper to use for each UI library primitive** (e.g. for a dropdown, use `<app-select>` not `p-dropdown`)
- Check `docs/plans/` → **if a plan for this feature exists** (written by `/plan`), it is the source
  of truth for scope, File Map, and task Interfaces — follow it for Steps 2 and 3. If the feature is
  large and no plan exists, suggest running `/plan` first, then continue if I want to.
- **Open the Reference Example files** listed in `project-rules.md` (best existing service / page / component / spec) and mirror their style — this is the strongest signal for matching the project's real conventions
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

## Step 4: Write Tests
Dispatch the **`angular-test-writer`** agent (isolated context — it follows
`.claude/references/test-spec.md`), or run `/write-tests` inline for a small feature. Either way:
- Service: mock HttpClient, test success + error + empty per method
- Component: mock service, test render + interaction + loading + error states

## Step 5: Update Documentation
- `docs/API_CONTRACT.md` if you used/discovered endpoints
- Create `CONTEXT.md` inside the feature folder (use /write-context)
- `docs/PROJECT-STATUS.md` (use /update-status)

## Step 6: Verify
- Build passes: `ng build` / `npx tsc --noEmit`
- All tests pass: `ng test` / `jest`
- Lint passes: `ng lint`
- Review before committing: dispatch the **`angular-reviewer`** agent (applies
  `.claude/references/review-checklist.md` in an isolated context), or run `/review-pr` inline
