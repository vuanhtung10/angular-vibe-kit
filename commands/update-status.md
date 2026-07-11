Update `docs/PROJECT-STATUS.md` based on what we did this session.

> **Ngôn ngữ:** viết nội dung docs bằng tiếng Việt (giữ nguyên tên file/module bằng tiếng Anh).

Rules:
1. Read the current `docs/PROJECT-STATUS.md` first
2. Move completed items from "In Progress" → "Completed" (with date)
3. Add any new work done this session to "Completed"
4. Update "In Progress" with anything still unfinished (note which component/file)
5. Add discovered issues to "Deferred Issues" with priority [P1/P2/P3]
6. Add gotchas to "Warnings"
7. Update "Next Tasks" — reorder by current priority
8. Update the header: date, session number (increment by 1)
9. Keep the file under 80 lines — archive old "Completed" items if too long

After updating, commit code and docs together:
```
git add CLAUDE.md docs/ .claude/rules/ src/
git commit -m "feat: {what was built} + tests + docs"
```
Docs and code in the same commit — docs that lag behind code go stale.
