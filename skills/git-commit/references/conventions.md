# Commit Conventions

> **This project's prefix, language, and scope source come from the `## Commit Convention` block in
> `.claude/rules/project-rules.md`** (filled by `/init`). This file defines the generic rules; the
> project block supplies the project-specific values. Defaults if the block is missing: no prefix,
> language `vi`, scope derived dynamically from changed paths.

## Format

```
<prefix><type>(<scope>): <subject>

<body>

<footer>
```

- `<prefix>` — optional, from project-rules (e.g. `VIVAS_`). Default: empty.
- `<subject>`/`<body>`/`<footer>` — in the configured `language` (default Vietnamese).

## Types

| Type | When to use | Example change |
|------|-------------|----------------|
| `feat` | New feature | New component, endpoint, capability |
| `fix` | Bug fix | Crash, wrong logic, edge case |
| `refactor` | Restructure (no behavior change) | Rename, extract, reorganize |
| `docs` | Documentation | README, comments, CLAUDE.md |
| `style` | Formatting (no code change) | Lint fixes, whitespace |
| `test` | Add/update tests | `*.spec.ts` |
| `chore` | Maintenance | Dependencies, configs, scripts, environments |
| `perf` | Performance | Optimize query, reduce bundle size |
| `ci` | CI/CD | GitHub Actions, Docker |
| `build` | Build system | `angular.json`, `tsconfig`, webpack |
| `revert` | Revert a commit | Undo a previous commit |

## Auto-detect Type

| Changed files / content | Detected type |
|-------------------------|---------------|
| `*.spec.ts` only | `test` |
| `*.md` only | `docs` |
| `package.json`, `tsconfig*.json`, `.eslintrc*` only | `chore` |
| `src/environments/*.ts` only | `chore` |
| `angular.json`, `webpack*.js` | `build` |
| New files + new exports | `feat` |
| Fixed logic / error handling in existing files | `fix` |
| Renamed / moved files, no logic change | `refactor` |

## Scope Detection (dynamic — derive, don't hardcode)

Derive `<scope>` from the staged file paths + the project's **Folder Structure** in
`.claude/rules/project-rules.md` / `docs/ARCHITECTURE.md`:

- Scope = the top-level feature/module folder the changed files live in — e.g. under
  `src/app/features/<scope>/…` or `src/app/modules/<scope>/…` (use the project's actual layout).
- Shared / cross-cutting folders map to their own scope name (e.g. `shared`, `core`, `layout`).
- Changes spanning multiple modules → **omit the scope**.

## Subject Rules
- Prepend the configured prefix (if any) before `<type>`.
- Configured language, concise and clear.
- No trailing period.
- ≤ 50 characters.
- Imperative mood (VI: "thêm", "sửa", "cập nhật", "xóa" / EN: "add", "fix", "update", "remove").

## Body Rules
- Separate from subject with a blank line.
- Explain WHAT and WHY, not HOW.
- Bullet points for multiple changes.
- Wrap at 72 characters.

## Examples

> These show the *shape*. The prefix depends on the project's config — shown both ways.

### No prefix (default conventional commit)
```
fix(users): sửa lỗi null khi load danh sách người dùng
```

### With a configured prefix (e.g. project sets Prefix: VIVAS_)
```
VIVAS_feat(reports): thêm chức năng xuất báo cáo PDF

- Thêm report-export component
- Hỗ trợ filter theo thời gian và khu vực
```

### Multiple modules → omit scope
```
fix: sửa giao diện và validate ở nhiều module
```

### Breaking change
```
feat(api)!: thay đổi cấu trúc response

BREAKING CHANGE: Response được bọc trong { success, data, error }.
```
