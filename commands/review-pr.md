Review the current code changes against this project's Angular standards.

1. Get the diff: run `git diff` (unstaged) and `git diff --staged`, or `git diff <base>...HEAD` if a
   base branch is named. Review only the changed code.
2. Apply the full checklist in `.claude/references/review-checklist.md` — it defines the review
   dimensions, the Precedence rule (a valid project convention wins; don't flag legacy), and the
   🔴/🟡/🟢 output format. That file is the single source of truth for what "correct" means here.
3. Output the report **inline** in this conversation using the format from the checklist. If there are
   no blockers, say so explicitly.

> For a large diff, or to review in the background while you keep coding, dispatch the
> `angular-reviewer` agent instead — it applies the same checklist in an isolated context.
