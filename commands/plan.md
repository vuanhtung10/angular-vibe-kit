Plan a feature before writing any code: clarify the requirement, weigh approaches, agree on a
design, then write a detailed, task-by-task implementation plan to `docs/plans/`.

This command produces a PLAN, not code. It writes exactly one file — the plan document — and
nothing else. `/dev-cycle` (gated, recommended) or `/new-feature` (linear) then execute it.

Angular idioms depend on the project version — the plan defers to `.claude/angular-practices/` and
to the **Precedence** rule in `.claude/rules/project-rules.md` (a valid project convention wins over
the BP profile; the profile applies only where the project has no convention or is below standard,
new code only; legacy modules are never refactored).

## Running under Claude Code's Plan Mode

If this session is in **Plan Mode** (you were given a plan-mode file path and told to use
`ExitPlanMode` for approval), `Write`/`Edit` are restricted to that one file — you cannot write
`docs/plans/<feature>.md` directly until Plan Mode ends. In that case:
- Phases A–D run exactly as written below (they are read-only or pure conversation).
- Phase D's GATE is skipped as a separate yes/no — approval happens via `ExitPlanMode` instead (see
  Phase E's Plan Mode branch).
- Phase E branches: compose + self-review the plan first, write it into the Plan Mode file, call
  `ExitPlanMode`, and only after the user approves (Plan Mode ends) write the real
  `docs/plans/<feature>.md` — same content, now at its real path.

If this session is NOT in Plan Mode, ignore this section — run every phase as written, gates
included.

---

## THE GATE RULE (applies after Phases B, C, D — non-negotiable)

After a gated phase you MUST:
1. Print a short summary of what was decided.
2. Ask the gate question exactly as written for that phase.
3. Then WAIT. Do not proceed on silence or assumption.
4. If the user approves → continue to the next phase.
5. If the user asks for changes → revise in place and re-ask the same gate. Do not skip ahead.

Write NO code and scaffold NOTHING in any phase. The only file this command creates is the plan doc.

---

## Phase A — Context (no gate)

Read, in this order:
- `CLAUDE.md`
- `.claude/rules/project-rules.md` → Precedence, naming, structure, Coexistence, **Reference Examples**
- `docs/ARCHITECTURE.md` → where this feature fits
- `docs/api-contracts/README.md` (shared Base URL/envelope/auth) and `docs/api-contracts/{feature}.md` if it exists → endpoints + payload shapes this feature will touch
- `docs/DESIGN_SYSTEM.md` → shared components + **Wrapped Components table**
- `.claude/angular-practices/` → the version profile
- **Open the Reference Example files** listed in `project-rules.md` (best existing service / page /
  component / spec) — the plan's file shapes and interfaces should mirror them.

---

## Phase B — Clarify the requirement

1. **Scope check first.** If the request describes several independent subsystems (e.g. "a portal
   with orders, chat, billing, and reports"), STOP and propose splitting it: name the independent
   pieces and suggest one plan per piece. Brainstorm the first piece here; the rest get their own
   `/plan` runs later. Do not spend questions on a feature that needs decomposition first.
2. For an appropriately-scoped feature, ask the clarifying questions you need — purpose,
   constraints, success criteria, edge cases, which endpoints/screens are in scope.
   - **Batch them** (ask all open questions in one message, like `/init` Stage 1). Do not drip one
     question per message.
   - Prefer multiple-choice / yes-no phrasing where possible.
   - Don't ask what the docs already answer — pull it from Phase A instead.
3. **Adaptive follow-up:** if an answer reveals a new ambiguity you didn't anticipate (e.g. the user
   mentions a status field that implies a workflow you need to understand), ask that **one**
   follow-up question before the gate — don't silently guess, and don't revert to asking every
   remaining question one at a time.
4. **GATE:** "✅ Requirements clear? (yes / add more)" — WAIT for answers. Write nothing until you
   have them.

---

## Phase C — Approaches

1. Propose **2-3 approaches** with trade-offs (e.g. one feature service vs. split by concern;
   reuse an existing service's pagination vs. a new one; smart/dumb split granularity).
2. Lead with your **recommendation and why**, framed against this project's conventions and version
   idioms — not generic advice.
3. **GATE:** "✅ Which approach? (1 / 2 / 3 / other)" — WAIT.

---

## Phase D — Design

1. Present the design in short sections, each scaled to its complexity (a few sentences each, more
   only if nuanced): architecture & where it sits, data flow, components (smart/dumb split),
   error/loading/empty handling, testing scope.
2. Note explicitly which **shared wrappers** the UI will use (from the Wrapped Components table) and
   which **endpoints** from `docs/api-contracts/{feature}.md` (or `README.md` if the feature has no
   file yet) it consumes.
3. **GATE (skip if in Plan Mode — see below):** "✅ Design OK? Write the plan? (yes / revise)" — WAIT.
   There is no separate design file — once approved, the design goes straight into the plan header.
   **If in Plan Mode**, don't ask this separately — go straight to Phase E; `ExitPlanMode` there is
   the approval.

---

## Phase E — Write the plan

1. Determine today's date and the feature name → target path
   `docs/plans/YYYY-MM-DD-<feature-name>.md`.
2. Compose the plan content **strictly following `.claude/references/plan-spec.md`**: header (Goal /
   Architecture / Approach chosen / Global Constraints), File Map, then tasks in Implementation
   Order (Model → Service → Routes → Pages → Components → Tests), each with `Files:`,
   `Interfaces: Consumes/Produces`, and concrete steps with real code — **no placeholders**.
3. Run the **Self-Review checklist** from `plan-spec.md` (requirement coverage, placeholder scan,
   type consistency vs. `docs/api-contracts/{feature}.md`, wrapper check, layout check). Fix issues inline. Do this
   BEFORE anything gets written below — either route commits the reviewed version.

**Not in Plan Mode:**
4. Create `docs/plans/` if it doesn't exist, write the reviewed content to the target path. Done.

**In Plan Mode:**
4. Write the reviewed content to the Plan Mode file (the one path you're currently allowed to
   write). This is the plan the user will see when reviewing.
5. Call `ExitPlanMode`. This IS the approval gate for Phases D and E — do not also ask the Phase D
   text gate.
6. Once the user approves and Plan Mode ends, immediately — before doing anything else — create
   `docs/plans/` if needed and write the **same reviewed content** to
   `docs/plans/YYYY-MM-DD-<feature-name>.md`. This is the real deliverable; the Plan Mode file was
   only the approval copy.

---

## Phase F — Handoff

Once `docs/plans/<file>.md` exists for real (directly from Phase E, or after the Plan Mode
approval + follow-up write), print:
> ✅ Plan saved to `docs/plans/<file>` — <N> tasks. I ran the self-review and fixed: <list, or "no
> issues">. Review it, then run **`/dev-cycle`** (gated, recommended) or **`/new-feature`** (linear)
> — both will detect and follow this plan.

Do not start implementing. The user reviews the plan first.
