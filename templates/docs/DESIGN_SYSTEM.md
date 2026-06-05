# Design System

> Run `/init` to populate from your project's styles and UI library config.

## UI Library
{{Angular Material / PrimeNG / Tailwind / custom}}

## Design Tokens
| Token | Value |
|-------|-------|
| Primary | {{e.g. #2563eb}} |
| Danger | {{...}} |
| Spacing scale | {{4 / 8 / 12 / 16 / 24 / 32}} |
| Breakpoints | {{mobile 375 / tablet 768 / desktop 1280}} |

## Shared Components
| Component | Role |
|-----------|------|
| Spinner | Loading indicator |
| EmptyState | No data message |
| ErrorMessage | Error display |
| ConfirmDialog | Confirmation modal |

## Wrapped Components
> If this section is present and non-empty, ALWAYS prefer the wrapper over the
> raw library component. Add a row only when a shared wrapper exists.
> `/init` auto-detects these; the team confirms in Stage 1.

| Need (library component) | Use this wrapper | Custom additions | Location |
|---------------------------|------------------|------------------|----------|
| `{{p-dropdown}}` | `{{<app-select>}}` | {{Loading state, error display, label slot}} | `{{shared/components/select/}}` |
| `{{p-calendar}}` | `{{<app-date-picker>}}` | {{Min/max date, locale, disabled dates}} | `{{shared/components/date-picker/}}` |

### Priority Order (must follow)
1. **Wrapper in `shared/components/`** (or `ui/`, `common/`, `components/` — record actual folder) — ALWAYS use it when one exists
2. **Library component direct** — use only when no wrapper exists; import the library type
3. **Custom build from scratch** — only when the library has no equivalent

### When you cannot find a wrapper
- Search the project's wrapper folder first (recorded above)
- If still unsure, ASK the team: "Có wrapper nào tôi chưa biết không?"
- NEVER silently import the library and bypass the wrapper

## Rules
- Every page must handle loading / error / empty states
- Use design tokens, not hardcoded values
- New shared UI goes in `shared/` only if used by 2+ features
- If a wrapped component exists for a UI need, you MUST use the wrapper — never the raw library component directly
