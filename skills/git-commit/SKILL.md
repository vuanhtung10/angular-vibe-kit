---
name: git-commit
description: >
  Write conventional commit messages for this project.
  Use when the user says "commit", "git commit", "save changes",
  "tạo commit", "viết commit message", or finished a task and wants to commit.
argument-hint: "[type] [message]"
allowed-tools:
  - Bash
  - Read
---

# Commit Message Generator

Generates conventional commit messages that follow **this project's** convention. It is
project-agnostic: the prefix, language, and scope source are read at runtime from the project's
config — nothing is hardcoded.

## Read the project's convention first
Read the `## Commit Convention` block in `.claude/rules/project-rules.md` (filled by `/init`). It
defines:
- **Prefix** — an optional string prepended before `<type>` (e.g. `VIVAS_`). **Default: none.**
- **Language** — the language for subject/body. **Default: `vi` (Vietnamese).**
- **Scope source** — the folder level scope is derived from (see below).

If that block is missing, fall back to: no prefix, language `vi`, scope derived dynamically.
Full rules and type/subject conventions: `.claude/skills/git-commit/references/conventions.md`.
(The `angular-git-workflow` agent reads the same block — keep them consistent.)

## Format
```
<prefix><type>(<scope>): <subject>
```
- `<prefix>` from project-rules (default empty → standard conventional commit).
- `<type>`: feat, fix, refactor, docs, style, test, chore, perf, ci, build, revert.
- `<scope>`: derived from changed paths (see Scope Detection); omit if changes span multiple modules.
- `<subject>`: in the configured language, imperative, ≤50 chars, no trailing period.

## Usage
```
/commit                     → Auto-detect type + scope from staged changes
/commit feat add login      → Quick commit with type + message
/commit --amend             → Amend last commit message
```

## Workflow
1. **Stage** (if nothing staged): `git add .`
2. **Inspect**: `git diff --staged --stat` then `git diff --staged`.
3. **Read convention**: the `## Commit Convention` block (prefix/language/scope source) +
   `references/conventions.md`.
4. **Detect type** from changed files/content (see conventions.md table).
5. **Derive scope** (see below).
6. **Generate message** → show a preview:
   ```
   📝 COMMIT PREVIEW

   <prefix><type>(<scope>): <subject in configured language>

   - <body bullet 1>
   - <body bullet 2>

   Staged files (N):
     M <path>
     A <path>
   ```

   Then use the **AskUserQuestion** tool — question: "Commit with this message?", options:
   "Yes, commit" / "Edit the message" / "No, abort".
7. **Execute after the popup answer**: "Yes, commit" → `git commit -m "..."`; "Edit the message" →
   user tweaks (via "Other" or a follow-up) then commit; "No, abort" → abort (keep staged).

## Scope Detection (dynamic — no hardcoded table)
Derive `<scope>` from the staged file paths + the project's **Folder Structure** in
`.claude/rules/project-rules.md` / `docs/ARCHITECTURE.md`:
- Scope = the top-level feature/module folder the changed files live in (e.g. under
  `src/app/features/<scope>/…` or `src/app/modules/<scope>/…` — use the project's actual layout).
- Shared/cross-cutting folders map to their own scope (e.g. `shared`, `core`, `layout`).
- Changes spanning multiple modules → **omit the scope**.

## Quick Commit
Skip the preview for trivial changes:
```
/commit fix typo in readme
    ↓
git commit -m "<prefix>fix: typo in readme"
```

## Rules
- **Follow the project's convention** — prefix, language, and scope come from project-rules; never
  hardcode a company prefix or module list here.
- **Language** — subject/body in the configured language (default Vietnamese; imperative: "thêm",
  "sửa", "cập nhật", "xóa").
- **Lowercase** type and scope. **No trailing period.** **50/72 rule** (subject ≤50, body wrap 72).
- **No Co-Authored-By** trailer.

## Amend Last Commit
```bash
git commit --amend -m "<prefix><type>(<scope>): new message"
```

## Error Handling
| Issue | Action |
|-------|--------|
| No staged changes | Stage with `git add .` or ask the user what to stage |
| No changes at all | Report "nothing to commit" |
| User declines | Abort, keep staged |
| Convention block missing | Fall back to: no prefix, language vi, dynamic scope |
| Git error | Show error, suggest fix |
