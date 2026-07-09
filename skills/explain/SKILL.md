---
name: explain
description: >
  Explain Angular/TypeScript code, architecture, data flows, or technical decisions for THIS project.
  Use when the user says "explain", "giải thích", "how does this work", "what is", "tại sao", "why",
  "làm thế nào", "hoạt động ra sao", or wants to understand a file, component, service, module, pattern,
  routing, state management, HTTP flow, or an architectural decision.
argument-hint: "[code|concept|flow|why] [target]"
allowed-tools:
  - Read
  - Glob
  - Grep
---

# Explain Code — Angular

Explain code, architecture, and technical decisions for the Angular project you are in. This skill is
**project-agnostic**: it never assumes a version, UI library, state-management approach, or folder
layout — it reads those from the project's own docs and source before explaining.

> **Scope:** a specific file / concept / flow / decision, explained **in-thread**. To map a WHOLE
> unfamiliar repo (structure inventory, entry points, traced execution paths), use the
> `angular-onboarding` agent instead — it runs in an isolated context built for repo-wide mapping.

## Language
Explain in the project's configured language — read `language` from the `## Commit Convention` block in
`.claude/rules/project-rules.md`. **Default: Vietnamese** (technical terms kept in English), e.g.
"Component này dùng `@Input()` để nhận data từ parent".

## Load context first (never assume)
**Always read the project's docs before explaining** — they are the source of truth for how THIS
codebase works:
- `CLAUDE.md` — stack summary + entry points + links.
- `.claude/rules/project-rules.md` — folder structure, naming, conventions, Precedence.
- `docs/ARCHITECTURE.md` — layers, routing, state approach, HTTP/interceptor flow, auth.
- `docs/DESIGN_SYSTEM.md` — UI library + shared/wrapped components.
- `.claude/angular-practices/<version>.md` — the version-matched idioms.

Do NOT assume Angular version, UI library (Material/PrimeNG/ng-zorro/…), state management (NgRx/Signals/
BehaviorSubject/…), base-service patterns, routing strategy, or interceptors. Take them from the docs +
the actual code.

## Workflow

### 1. Determine mode
If the user didn't say, infer intent:
- Asks about a specific file → `code`
- Asks about a pattern/concept (lazy loading, a state pattern, a base service…) → `concept`
- Asks "how", "luồng", "flow" → `flow`
- Asks "why", "tại sao", "lý do" → `why`

If still unclear, use the **AskUserQuestion** tool — question: "Bạn muốn giải thích gì?", options:
"Code (file cụ thể)" / "Concept (khái niệm)" / "Flow (luồng xử lý)" / "Why (lý do thiết kế)".

### 2. Read order by mode
| Mode | Read in this order |
|------|--------------------|
| `code` | CLAUDE.md → project-rules (Folder Structure) → the target file → related files (service/model) |
| `concept` | CLAUDE.md + ARCHITECTURE.md → a **real example** of the concept from this codebase |
| `flow` | CLAUDE.md → ARCHITECTURE.md (HTTP/interceptor flow) → component → service → interceptor/state |
| `why` | ARCHITECTURE.md + project-rules → the relevant file → `docs/decisions/` (ADRs) if present |

### 3. Find the source file
If given only a name (no path), use `Glob` (e.g. `**/*{name}*`) to locate it. Use the Folder Structure
in `project-rules.md` / `docs/ARCHITECTURE.md` to navigate — do not rely on a memorized tree.

### 4. Use the templates
Read `./templates/vi.md` and pick the skeleton for the mode. The templates are structure-only —
fill every placeholder with facts read from THIS project's code (its UI library, its HTTP/service
pattern, its interceptors, its state approach), not assumptions.

## Rules
- **Read real files, never guess** — verify the code still exists and matches before explaining.
- **Docs are the source of truth** — patterns/conventions come from `project-rules.md` + `docs/`.
- **Detail level** — beginners: from basics with everyday analogies; intermediate (default): patterns +
  best practices; advanced: trade-offs + architectural decisions. Adjust to the question.
- **Structure**: (1) short summary (1–2 sentences) → (2) detailed explanation with real code → (3) key
  takeaways → (4) links to related parts of the system.

## Error handling
| Situation | Handling |
|-----------|----------|
| Mode unclear | Infer from the question; if still unclear, ask |
| File not found | `Glob` with `**/*{name}*` |
| File too large | Read in parts (offset/limit), focus on the relevant section |
| Need more context | CLAUDE.md → ARCHITECTURE.md → service → model → component, in order |
| Concept unclear | Find a real example in the codebase to illustrate |

## Examples
```
User: "Giải thích user-list.component.ts"
→ Mode: code → read CLAUDE.md + project-rules → the component (+ its service/model) → explain structure, data flow

User: "State management pattern ở đây là gì?"
→ Mode: concept → read ARCHITECTURE.md (state approach) → a real store/service example → explain the pattern used HERE

User: "Luồng đăng nhập chạy thế nào?"
→ Mode: flow → ARCHITECTURE.md (HTTP/interceptor) → login component → auth service → interceptor → render

User: "Tại sao module này lazy-load?"
→ Mode: why → ARCHITECTURE.md (routing) + the route config → explain reasons + trade-offs
```
