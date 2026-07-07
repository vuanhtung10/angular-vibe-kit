Start of a new coding session. Read context before doing anything.

## First: Has `/init` been run on this project?

Before reading anything, check `docs/PROJECT-STATUS.md`:
- If it still contains `{{` placeholders OR the comment `Run /init to populate`, **`/init`
  has not been run** for this project. Say EXACTLY this and STOP — do not read docs further,
  do not summarize:

  ```
  /init chưa được chạy cho dự án này. Tôi thấy docs/PROJECT-STATUS.md vẫn còn placeholder
  của kit. Hãy chạy:

      /init

  để quét codebase và điền docs (CLAUDE.md, ARCHITECTURE.md, PROJECT-RULES.md,
  PROJECT-STATUS.md, api-contracts/, decisions/, ...). Sau khi xong, quay lại
  gõ /start.
  ```

- Otherwise continue below.

## Read These (always)
- Read `CLAUDE.md` → project overview and links to docs
- Read `docs/PROJECT-STATUS.md` → current progress, warnings, next tasks

## Read These (only when needed)
- `.claude/rules/project-rules.md` → ONLY if this is your first session OR you're about to write code
- `docs/ARCHITECTURE.md` → ONLY if task involves cross-module work or a new feature
- `docs/api-contracts/<feature>.md` (or `README.md` for shared conventions) → ONLY if task involves calling backend endpoints
- `docs/DESIGN_SYSTEM.md` → ONLY if task involves UI/components
- A feature's `CONTEXT.md` → ONLY if you're modifying that feature

## After Reading, Tell Me
1. What was last completed
2. What is in progress (if any)
3. Any active warnings
4. Suggested next task

## Then Wait
Do NOT start coding. Wait for me to confirm or change the task.
