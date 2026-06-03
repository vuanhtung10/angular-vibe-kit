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

## Rules
- Every page must handle loading / error / empty states
- Use design tokens, not hardcoded values
- New shared UI goes in `shared/` only if used by 2+ features
