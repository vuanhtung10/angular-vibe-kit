Run the full feature development cycle for one Angular feature, end to end:
scaffold → implement → test → context → review → wrap up.

This is an ORCHESTRATOR. It chains the other commands' logic, but it is NOT
fully autonomous: after every phase it STOPS at a gate and waits for your
explicit confirmation before continuing.

---

## THE GATE RULE (applies after EVERY phase — non-negotiable)

After finishing each phase, you MUST:
1. Print a short summary of what was just done.
2. Ask exactly: **"✅ Continue to Phase X? (yes / no)"**
3. Then WAIT. Do not proceed on silence, timeout, or assumption.
4. If the user replies **yes / ok / continue / tiếp** → move to the next phase.
5. If the user replies **anything else** (no / stop / "sửa lại ..." / a change request / a question)
   → **EXIT the automated cycle immediately.** Drop into normal interactive mode and
   do whatever the user asks. Do NOT try to resume the cycle unless the user explicitly
   says to continue.

Never skip a gate. Never batch multiple phases past a gate. The user is always in control.

---

## Phase 0 — Kickoff

1. Read context:
   - `.claude/rules/project-rules.md`
   - `docs/ARCHITECTURE.md`
   - `docs/API_CONTRACT.md`
   - `docs/DESIGN_SYSTEM.md`
   - `.claude/angular-practices/` (the version profile)
2. Ask ONE question: **"What is the feature name and what does it do?"** (name + one sentence)
3. **GATE:** Wait for the answer. Write no code until you have it.

---

## Phase 1 — Scaffold

1. Create the full folder + empty-file structure for `features/{feature-name}/`
   (model, service, routes, pages/, components/ — match the layout in project-rules.md).
2. Print the created file tree.
3. **GATE:** "✅ Folder structure OK? Continue to Phase 2 (Model + Service)? (yes / no)"

---

## Phase 2a — Implement Model + Service

1. Write `models/{feature}.model.ts` — interfaces mirroring the backend's actual response shape from `API_CONTRACT.md` (envelope, raw DTO, or GraphQL type — per `project-rules.md`).
2. Write `services/{feature}.service.ts` — data-access methods returning `Observable<T>` typed with the project's response shape,
   following the DI/idiom of the version profile.
3. Print the two files.
4. **GATE:** "✅ Model + Service OK? Continue to Phase 2b (Routes + UI)? (yes / no)"
   > This gate matters most — a wrong type/endpoint here breaks every component after it.

---

## Phase 2b — Implement Routes + Pages + Components

1. Write `{feature}.routes.ts` (lazy-loaded).
2. Write page (smart) components — data, loading/error/empty states.
3. Write presentational (dumb) components — inputs/outputs only.
4. Print a summary of files written.
5. **GATE:** "✅ UI components OK? Continue to Phase 3 (Tests)? (yes / no)"

---

## Phase 3 — Tests + Context

1. Write tests following `/write-tests`:
   - `{feature}.service.spec.ts` (mock HttpClient: success + error + empty per method)
   - `{feature}-list.component.spec.ts` (mock service: render + interaction + loading + error)
2. **Harness loop — tests (automated within this phase, max 3 rounds):**
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
3. After tests pass, write the feature's `CONTEXT.md` in the same folder created in Phase 1 (per `/write-context`).
4. **GATE:** "✅ Tests pass (round {n}) + CONTEXT.md written. Continue to Phase 4 (Review)? (yes / no)"

---

## Phase 4 — Review + Harness

1. Run the full `/review-pr` checklist (all 8 categories).
2. Print the result: count of 🔴 blockers, 🟡 suggestions, 🟢 good parts.
3. If 0 blockers → skip the loop, go straight to the Phase 4 gate.
4. If there are blockers:
   - **GATE:** "🔴 {n} blockers found. Auto-fix and re-review? (yes / no)"
     - NO → exit the automated cycle; user fixes manually.
     - YES → **Harness loop — review (max 3 rounds):**
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
6. **GATE:** "✅ Review clean (0 blockers after {n} rounds). Continue to Phase 5 (Wrap up)? (yes / no)"

---

## Phase 5 — Wrap up

1. Update `docs/PROJECT-STATUS.md` (per `/update-status` — move to Completed, bump session).
2. Update `docs/API_CONTRACT.md` if new endpoints were used.
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
