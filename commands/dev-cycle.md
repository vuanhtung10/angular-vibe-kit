Run the full feature development cycle for one Angular feature, end to end:
scaffold → implement → test → context → review → wrap up.

> **Ngôn ngữ:** mọi tóm tắt/gate/report ở các Phase viết bằng tiếng Việt; giữ nguyên tên file/lệnh/code.

This is an ORCHESTRATOR. It chains the other commands' logic, but it is NOT
fully autonomous: after every phase it STOPS at a gate and waits for your
explicit confirmation before continuing.

Angular idioms depend on the project version — read `.claude/angular-practices/` and follow it.
**Precedence** (see `.claude/rules/project-rules.md` → Precedence): a valid project convention wins
over the BP profile; the profile applies only where the project has no convention or is below
standard (new code only); legacy modules are never refactored.

---

## THE GATE RULE (applies after EVERY phase — non-negotiable)

After finishing each phase, you MUST:
1. Print a short summary of what was just done.
2. Use the **AskUserQuestion** tool to raise the gate — never ask a gate question as plain chat
   text. Header `"Gate"`, options `"Continue"` (move to the next phase) and `"Stop / change
   something"` (exit the cycle). Each gate below gives the exact question text to pass.
3. WAIT for the popup answer. Do not proceed on silence, timeout, or assumption.
4. If the user picks **Continue** → move to the next phase.
5. If the user picks **Stop / change something** (or answers via "Other" with a change request /
   a question) → **EXIT the automated cycle immediately.** Drop into normal interactive mode and
   do whatever the user asks. Do NOT try to resume the cycle unless the user explicitly
   says to continue.

Never skip a gate. Never batch multiple phases past a gate. The user is always in control.

---

## Phase 0 — Kickoff

1. Read context:
   - `CLAUDE.md`
   - `.claude/rules/project-rules.md` → naming, structure, Coexistence, **Reference Examples**
   - `docs/ARCHITECTURE.md`
   - `docs/api-contracts/README.md` → shared Base URL, Response Envelope, Auth
   - `docs/DESIGN_SYSTEM.md` → shared components + Wrapped Components table
   - `.claude/angular-practices/` (the version profile)
   - **`docs/plans/`** → if a plan for this feature exists, read it in full; it is the source of
     truth for scope, File Map, and task Interfaces (written by `/plan` per
     `.claude/references/plan-spec.md`)
   - **Open the Reference Example files** listed in `project-rules.md` (best existing service / page /
     component / spec) and mirror their style — the strongest signal for matching real conventions
2. Establish the feature:
   - **If a plan was found** → the name and scope come from the plan's Goal. Do NOT re-ask them;
     confirm via **AskUserQuestion** — question: "Found plan `docs/plans/<file>` — follow it?",
     options: "Follow this plan" / "No — let me clarify first".
   - **If no plan** → ask ONE question: **"What is the feature name and what does it do?"** (name +
     one sentence — open-ended, so this stays a plain chat question). If anything else about scope
     is unclear, ask it in the same batch — don't guess. When the feature looks large (several
     screens or endpoints), add one line: *"This looks sizeable — consider running `/plan` first
     for a reviewed task breakdown."* — then continue anyway if the user wants to.
3. **GATE:** Wait for the answer / confirmation. Write no code until you have it.

---

## Phase 1 — Scaffold

1. Create the full folder + empty-file structure. **If a plan was found in Phase 0, create exactly
   the files in the plan's File Map** (it already reflects the project's real layout). Otherwise
   follow `.claude/references/feature-structure.md` → Folder Structure, using the project's actual
   layout and folder names from `project-rules.md` (the reference file's tree is only the default shape).
2. Print the created file tree.
3. **GATE:** AskUserQuestion — question: "Folder structure OK? Continue to Phase 2 (Model + Service)?", options: "Continue" / "Stop / change something".

---

> Follow `.claude/references/feature-structure.md` → Coding Rules throughout Phase 2a and 2b
> (`OnPush`, subscription teardown per profile, no `any`, project's forms approach, no hardcoded
> URLs, wrapper priority — never import a raw UI-library component when a wrapper exists).

> If a plan was found in Phase 0, implement each piece from its tasks: use the exact model/DTO
> shapes and service signatures declared in the tasks' `Interfaces: Consumes/Produces` blocks.

## Phase 2a — Implement Model + Service

1. Write `models/{feature}.model.ts` — interfaces mirroring the backend's actual response shape from `docs/api-contracts/{feature}.md` if it exists, else the envelope in `docs/api-contracts/README.md` (raw DTO or GraphQL type — per `project-rules.md`), matching the plan's declared types if a plan exists.
2. Write `services/{feature}.service.ts` — data-access methods returning `Observable<T>` typed with the project's response shape,
   following the DI/idiom of the version profile.
3. Print the two files.
4. **GATE:** AskUserQuestion — question: "Model + Service OK? Continue to Phase 2b (Routes + UI)?", options: "Continue" / "Stop / change something".
   > This gate matters most — a wrong type/endpoint here breaks every component after it.

---

## Phase 2b — Implement Routes + Pages + Components

1. Write `{feature}.routes.ts` (lazy-loaded).
2. Write page (smart) components — data, loading/error/empty states.
3. Write presentational (dumb) components — inputs/outputs only.
4. Print a summary of files written.
5. **GATE:** AskUserQuestion — question: "UI components OK? Continue to Phase 3 (Tests)?", options: "Continue" / "Stop / change something".

---

## Phase 3 — Tests + Context

1. **Verify the build first**: `ng build` / `npx tsc --noEmit` and `ng lint`. Fix any failure
   immediately — a broken build makes test results meaningless, and this must not slip through to
   Phase 4 or the commit in Phase 5.
2. Write tests by dispatching the **`angular-test-writer`** agent (isolated — it follows
   `.claude/references/test-spec.md`), or run `/write-tests` inline:
   - `{feature}.service.spec.ts` (mock HttpClient: success + error + empty per method)
   - `{feature}-list.component.spec.ts` (mock service: render + interaction + loading + error)
3. **Harness loop — tests (automated within this phase, max 3 rounds):**
   ```
   round = 1
   while round <= 3:
     say "Running tests, round {round}/3..."
     run: ng test {feature} (or jest {feature})
     if PASS: break
     read the failure output → fix the code/test → round += 1
   if still failing after 3 rounds:
     print remaining errors
     GATE: "❌ Tests still failing after 3 rounds. Exiting cycle — handle manually."
     → exit the automated cycle
   ```
4. After tests pass, write the feature's `CONTEXT.md` in the same folder created in Phase 1 (per `/write-context`).
5. **GATE:** AskUserQuestion — question: "Build/lint clean + tests pass (round {n}) + CONTEXT.md written. Continue to Phase 4 (Review)?", options: "Continue" / "Stop / change something".

---

## Phase 4 — Review + Harness

1. Review by dispatching the **`angular-reviewer`** agent (isolated), or run `/review-pr` inline —
   both apply `.claude/references/review-checklist.md` (all dimensions).
2. Print the result: count of 🔴 blockers, 🟡 suggestions, 🟢 good parts.
3. If 0 blockers → skip the loop, go straight to the Phase 4 gate.
4. If there are blockers:
   - **GATE:** AskUserQuestion — question: "{n} blockers found. Auto-fix and re-review?", options:
     "Auto-fix and re-review" / "Stop — I'll fix manually".
     - "Stop — I'll fix manually" → exit the automated cycle; user fixes manually.
     - "Auto-fix and re-review" → **Harness loop — review (max 3 rounds):**
       ```
       round = 1
       while round <= 3:
         say "Fix round {round}/3 — fixing: {list of blockers}"
         fix ALL 🔴 blockers
         re-run /review-pr checklist
         if 0 blockers: break
         round += 1
       if blockers remain after 3 rounds:
         print remaining blockers
         GATE: "❌ Blockers remain after 3 rounds. Exiting cycle — handle manually."
         → exit the automated cycle
       ```
5. 🟡 Suggestions are NOT blocking — list them so the user can decide later.
6. **GATE:** AskUserQuestion — question: "Review clean (0 blockers after {n} rounds). Continue to Phase 5 (Wrap up)?", options: "Continue" / "Stop / change something".

---

## Phase 5 — Wrap up

1. Update `docs/PROJECT-STATUS.md` (per `/update-status` — move to Completed, bump session).
2. Sync `docs/api-contracts/{feature}.md` per `/write-api-contracts {feature}` — only if endpoints
   changed in this feature (creates the file and adds a row to `docs/api-contracts/README.md`'s
   Domains table if no file yet). The command merges intelligently, so re-running it is always safe.
3. Generate a commit message: `feat({feature-name}): {description} + tests + docs`.
4. Print the git command for the user to run:
   ```
   git add CLAUDE.md docs/ .claude/rules/ src/
   git commit -m "feat({feature-name}): {description} + tests + docs"
   ```
5. **Do NOT run git yourself.** The user reviews and commits.
6. Final message: "✅ dev-cycle complete. Run the git command above to commit."

---

## Notes
- Harness loops (Phase 3 tests, Phase 4 review) run automatically WITHIN their phase —
  they handle mechanical errors (compile, test failures, checklist blockers) without bugging you.
- But the loops are bounded (max 3 rounds) and never cross a phase gate.
- Logic correctness ("does it do what I actually wanted?") is checked by YOU at the gates,
  not by the harness — that is why the human gates exist.
