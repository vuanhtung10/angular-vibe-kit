# angular-vibe-kit

Bootstrap a **Vibe Coding workflow** into any Angular project: a `CLAUDE.md`, a set
of project docs, and Claude Code slash-commands — with **best-practice rules matched
to your Angular version**.

Join an existing Angular project, run one command, and your AI assistant gains a
persistent memory of how *this* codebase works.

---

## Why

AI coding tools have no memory between sessions. Without a project context file they
re-guess your conventions every time — wrong component patterns, wrong API shapes,
wrong state management. This kit generates that context **from your actual codebase**,
and keeps the AI honest with version-correct Angular rules (v14 → v19).

It also handles the real-world case: **the project isn't fully best-practice yet.**
The kit adds correct rules for *new* code without forcing risky refactors on legacy
modules (Strangler Fig). And when the project wraps its UI library in `shared/components/`,
the kit teaches the AI to always use the wrapper, not the raw library import.

---

## Install

Run inside the root of your Angular project:

```bash
npx @tungvivas/angular-vibe-kit
```

The installer (no AI, fully deterministic):

1. Reads `./package.json` → detects your Angular version
2. Copies slash-commands → `./.claude/commands/`
3. Copies the **version-matched** best-practice file → `./.claude/angular-practices/`
4. Installs **skills** → `./.claude/skills/` (auto-applied by Claude — no command needed)
5. Installs **references** → `./.claude/references/` (shared review checklist + test spec)
6. Installs **agents** → `./.claude/agents/` (Angular subagents, isolated context)
7. Writes **settings.json** → `./.claude/settings.json` (allowlist + build-verify hook)
8. Copies doc templates → `./docs/` and `./CLAUDE.md`, rules → `./.claude/rules/`
9. Tells you to run `/init` in Claude Code

> Requires Node.js 16+ (only for the installer — your project stays pure Angular).

### Options
| Flag | Effect |
|------|--------|
| `--version <n>` | Override detected version (e.g. `--version 17`) |
| `--force` | Overwrite files that already exist |
| `--dry-run` | Show what would happen, write nothing |
| `-h, --help` | Help |

---

## Use

After install, open the project in **Claude Code**:

```
/init            ← scan codebase, ask to confirm uncertain bits, generate docs
```

`/init` generates, one file at a time (you review each):
`CLAUDE.md` → `docs/api-contracts/` (index + one file per feature) → `docs/ARCHITECTURE.md` →
`docs/PROJECT-RULES.md` → `docs/PROJECT-STATUS.md` → `docs/DESIGN_SYSTEM.md` →
`docs/decisions/`.

Then every working session:

| Command | When | Does |
|---------|------|------|
| `/start` | Start of session | Read docs, summarize progress, wait |
| `/convert-srs` | Non-MD SRS source (PDF/DOCX/PPTX/XLSX/ảnh) | Wraps `markitdown` → split multi-module → index `docs/srs/` |
| `/plan` | Large feature, before coding | Clarify → approaches → design → write task-by-task plan to `docs/plans/` |
| `/new-feature` | New module — code only | Scaffold → implement. Tests/docs/review run separately via `/write-tests` / `/write-context` / `/write-api-contracts` / `/update-status` / `/review-pr` |
| `/write-tests` | Code without tests | Service spec + component test |
| `/write-context` | New/complex module | Create `CONTEXT.md` snapshot |
| `/write-api-contracts` | New endpoints, contract drift | Sync `docs/api-contracts/<feature>.md` + Domains index from the feature's service code |
| `/review-pr` | Before commit | Angular review checklist → 🔴/🟡/🟢 |
| `/update-status` | End of session | Update `PROJECT-STATUS.md` + commit |
| `/dev-cycle` | Whole feature | Gated end-to-end orchestrator |

**Recommended flow for a sizeable feature:** `/convert-srs` (only if your SRS arrives as a
non-Markdown file — PDF/DOCX/PPT/XLSX/ảnh/audio/YouTube/ZIP/EPub) → `/plan` → review the plan doc → `/dev-cycle` (or
`/new-feature`). `/plan` clarifies the requirement, weighs 2-3 approaches, and writes a reviewed,
task-by-task plan to `docs/plans/`; both `/dev-cycle` and `/new-feature` **auto-detect that plan**
and follow its File Map and interfaces instead of re-deriving structure on the fly. Use
`/dev-cycle` for the full gated pipeline (implement → test → review → wrap-up), `/new-feature` for
code-only when you want to drive tests/docs/review manually. Small features can skip `/plan` and
go straight into `/dev-cycle` / `/new-feature`. The `/plan` workflow is adapted from
[obra/superpowers](https://github.com/obra/superpowers) (MIT).

If your requirements come in a non-Markdown format — Word `.docx`, PowerPoint, Excel, PDF spec,
screenshot, audio, YouTube transcript, EPub, ZIP — convert to Markdown **first** using
[Microsoft Markitdown](https://github.com/microsoft/markitdown) (preferred over `pandoc` for
PDF/PPTX/XLSX/image-OCR; LLM-token-optimized output). Either run
[`/convert-srs`](commands/convert-srs.md) (the kit's wrapper — it auto-splits multi-module sources
and indexes `docs/srs/`) or call markitdown directly:

```bash
# one-time install on your dev machine (NOT in package.json — the Angular project stays pure Node)
winget install astral-sh.uv && uv tool install "markitdown[all]"

markitdown ./specs/order-management.pdf -o docs/srs/order-management.md
```

Then split out just the module you're building and save it under
`docs/srs/<module-name>.md` (created by the installer — see `docs/srs/README.md`), and point
`/plan` at that file instead of pasting the whole SRS.

---

## Commands vs skills vs agents

The kit installs all three — they differ in **who triggers them** and **where they run**:

| | Command (`/start`, `/review-pr`) | Skill (`angular-practices`) | Agent (`angular-reviewer`) |
|---|---|---|---|
| **Who triggers it** | **You** type `/name` deliberately | **Claude** activates it when context matches | **You** (or Claude) dispatch by name |
| **Runs in** | Your main conversation | Your main conversation | An **isolated** context (parallel/background) |
| **Best for** | A workflow you run at a point in time | Knowledge that should apply *whenever* relevant | Heavy/parallel work without bloating the main thread |
| **Lives in** | `.claude/commands/` | `.claude/skills/<name>/SKILL.md` | `.claude/agents/<name>.md` |

So `/review-pr` stays a command (you choose when to review); `angular-practices` is a
skill (idioms auto-apply the moment you write a component, even in free-form chat); and
`angular-reviewer` is an agent (it reviews in a separate context, so you can keep coding while
it runs). The skill is a thin pointer to your `.claude/angular-practices/<version>.md` profile,
so there is a single source of truth (no duplication) — and the agents point to the skills too.

**No duplication between a command and its agent twin.** `/review-pr` and `angular-reviewer` both
apply the *same* `.claude/references/review-checklist.md`; `/write-tests` and `angular-test-writer`
both apply `.claude/references/test-spec.md`. The command runs it **inline**; the agent runs it in an
**isolated** context. Pick by weight:

| Situation | Reach for |
|-----------|-----------|
| Quick check, small diff, want to see the reasoning inline | the **command** (`/review-pr`, `/write-tests`) |
| Large diff / whole feature, or you want to keep coding while it runs | the **agent** (`angular-reviewer`, `angular-test-writer`) |
| Multi-phase feature build with gates | the **orchestrator** (`/dev-cycle`, `/new-feature`) — it dispatches the agents at the test & review phases |
| Knowledge that should apply *whenever* you write code | the **skill** (auto — no trigger) |

Six skills ship today:
- **angular-practices** — points to your version-matched profile; auto-applies when
  writing/reviewing/refactoring Angular code.
- **clarify-request** — normalizes vague prompts ("fix bug A", "thêm trường X") into a standard
  brief: fills context from your docs/code first, batch-asks only what's missing, then routes to
  the right command/agent (`/plan`, `angular-debugger`, `/review-pr`, or a direct edit).
- **component-wrapper-priority** — carries the decision tree for using your project's shared
  wrapper components instead of raw UI-library imports; auto-applies before a raw library import.
- **explain** — explains code / concepts / flows / decisions; reads your `docs/` + rules so the
  explanation matches *this* project (version/UI library/state/folder layout — nothing hardcoded).
- **git-commit** — generates conventional commit messages following your `## Commit Convention`
  in `project-rules.md` (prefix, language, and scope are per-project, filled by `/init`).
- **srs-ingest** — detects when you have a non-Markdown SRS source (PDF, DOCX, PPTX, XLSX, image
  with text, audio, YouTube URL) and points you at `/convert-srs` — it never edits `docs/srs/`
  itself, only routes you to the command that does the conversion.

## Agents (parallel / isolated context)

Eight Angular-specialized subagents run in their own context window — dispatch them by name, and
they can run in the **background** while you keep working. They all read your skills + profile +
`docs/` first, so their output matches *this* project's conventions, version idioms, and wrapper rules.

| Agent | Use for | How to call |
|-------|---------|-------------|
| **angular-reviewer** | Review changes before commit (read-only) | *"use angular-reviewer on my changes"* |
| **angular-build-fixer** | TypeScript/`ng build` errors (strict templates, imports) | *"use angular-build-fixer to fix this build"* |
| **angular-debugger** | Runtime errors — DI, change detection, RxJS leaks, routing | *"use angular-debugger to trace this NG0100"* |
| **angular-test-writer** | Write a feature's test suite + coverage | *"run angular-test-writer in the background for OrderComponent"* |
| **angular-a11y-auditor** | WCAG 2.2 AA audit — keyboard, screen reader, contrast, ARIA (read-only) | *"use angular-a11y-auditor on the checkout page"* |
| **angular-onboarding** | Understand an unfamiliar codebase — map + trace paths (read-only) | *"use angular-onboarding to explain this repo"* |
| **angular-ui-designer** | Design/extend the design system — tokens, states, responsive specs | *"use angular-ui-designer for the settings panel"* |
| **angular-git-workflow** | Atomic conventional commits, branching, rebase/merge, recovery | *"use angular-git-workflow to clean up my branch"* |

There is no slash syntax — agents are invoked in plain language (Claude dispatches them). They
complement, not replace, your own global agents and Claude Code's native worktree support.

## Automation (settings & hooks)

The installer writes a `.claude/settings.json` so vibe coding flows with fewer interruptions:

- **Permission allowlist** — pre-approves `ng`, `npm`, `npx`, `pnpm`, `yarn`, and read-only git
  (`status`, `diff`, `log`, `show`) so Claude isn't constantly asking permission. State-changing git
  (`commit`, `push`) is deliberately **not** allowed — you approve those.
- **Build-verify Stop hook** — after each turn it runs a fast type-check, but **only when `.ts` or
  `.html` files changed since `HEAD`** — so a question-only turn skips it entirely:

  ```
  git diff --quiet HEAD -- '*.ts' '*.html' || npx tsc --noEmit
  ```

  It uses your project's `typecheck` script if you have one. A type error is shown to Claude
  (non-blocking) so it can fix it before you commit — without trapping the session. Want full
  template checking? Swap `npx tsc --noEmit` for `ng build` (slower). **To disable:** delete the
  `hooks` block from `settings.json`.

If the project already has a `.claude/settings.json`, the installer **skips it** (won't overwrite your
settings) — merge the allowlist/hook in manually, or re-run with `--force`.

---

## Version-matched best practices

The installer copies exactly one profile based on your `@angular/core`:

| Angular | Profile | Key idioms |
|---------|---------|-----------|
| 14–15 | `v14-15.md` | NgModule, `*ngIf/*ngFor`, constructor DI, RxJS + `BehaviorSubject` |
| 16 | `v16.md` | `inject()`, required inputs, `takeUntilDestroyed`, Signals (preview) |
| 17 | `v17.md` | Standalone default, `@if/@for/@switch`, `@defer`, Signals stable |
| 18–19 | `v18-19.md` | Signal inputs/outputs, `linkedSignal`/`resource`, zoneless (experimental) |

These files cover **framework idioms only** (syntax, DI, components, RxJS/Signals).
Project-specific choices — folder layout, state-management, naming — are inferred
from your code and written into `docs/PROJECT-RULES.md`.

---

## Coexistence (joining a not-yet-standard project)

`/init` classifies what it finds as `standard`, `below-standard`, or `uncertain`,
then writes a **Coexistence Strategy** into `PROJECT-RULES.md`:

- Patterns you already do right → kept as required rules.
- Sub-standard patterns → correct rule applied to **new code only**.
- Legacy modules → listed as **do-not-touch** (no refactor unless asked).

Anything uncertain becomes a question — the kit never silently rewrites your rules.

---

## Component Wrapping (generic UI convention)

The kit enforces a generic priority rule for UI components:

1. **Wrapper in `shared/components/`** (or `ui/`, `common/`, etc.) — used if it exists for the need
2. **UI library direct** — used only if no wrapper exists; warning logged
3. **Custom build** — only when the library has no equivalent

When you run `/init`, it scans your codebase for wrapper components (sub-folders
of `shared/components/` that import a known UI library) and writes a
**Wrapped Components** table into `docs/DESIGN_SYSTEM.md`. From then on:
- the **component-wrapper-priority** skill auto-applies the rule whenever you write UI code
- `/new-feature` consults that table when generating UI code
- `/review-pr` **and** the `angular-reviewer` agent flag a wrapper-bypass as 🔴 BLOCKER in new code
- `/write-context` captures the WHY behind any library-direct decisions

Works for any UI library — PrimeNG, Material, ng-zorro, ng-bootstrap, custom.

---

## What gets created in your project

```
your-angular-app/
├── CLAUDE.md                       # generated/filled by /init
├── .claude/
│   ├── commands/                   # 11 slash-commands (copied by installer)
│   │   ├── init.md  start.md  plan.md  new-feature.md  review-pr.md
│   │   ├── write-tests.md  write-context.md  write-api-contracts.md
│   │   ├── update-status.md  dev-cycle.md  convert-srs.md
│   │   └── # convert-srs.md wraps `markitdown` (PDF/DOCX/PPTX/XLSX/ảnh) → `docs/srs/`
│   ├── angular-practices/          # 1 version-matched profile (copied)
│   │   └── v17.md
│   ├── references/                 # shared SoT — both commands & agents read these
│   │   ├── review-checklist.md     #   → /review-pr + angular-reviewer
│   │   ├── test-spec.md            #   → /write-tests + angular-test-writer
│   │   ├── feature-structure.md    #   → /new-feature + /dev-cycle (folder tree, order, coding rules)
│   │   └── plan-spec.md            #   → /plan writes it; /dev-cycle + /new-feature consume it
│   ├── skills/                     # auto-applied by Claude (no command needed)
│   │   ├── angular-practices/      #   → version idioms; triggers when writing Angular code
│   │   │   └── SKILL.md
│   │   ├── clarify-request/        #   → normalizes vague prompts into a standard brief + routes
│   │   │   └── SKILL.md
│   │   ├── component-wrapper-priority/  # → enforces shared wrappers over raw library imports
│   │   │   └── SKILL.md
│   │   ├── explain/               #   → explains code/concepts/flows in your project's language
│   │   │   ├── SKILL.md
│   │   │   └── templates/vi.md
│   │   ├── git-commit/            #   → conventional commits per your Commit Convention
│   │   │   ├── SKILL.md
│   │   │   └── references/conventions.md
│   │   └── srs-ingest/            #   → detects non-MD SRS mentions, points at /convert-srs
│   │       └── SKILL.md
│   ├── agents/                     # 8 Angular subagents (isolated context, run in parallel)
│   │   ├── angular-reviewer.md  angular-build-fixer.md  angular-debugger.md
│   │   ├── angular-test-writer.md  angular-a11y-auditor.md  angular-onboarding.md
│   │   └── angular-ui-designer.md  angular-git-workflow.md
│   ├── settings.json               # allowlist (fewer prompts) + build-verify Stop hook
│   └── rules/
│       └── project-rules.md        # auto-loaded every session (filled by /init)
└── docs/
    ├── ARCHITECTURE.md  DESIGN_SYSTEM.md                     # filled by /init
    ├── api-contracts/               # filled by /init — README.md index + one file per feature
    │   ├── README.md                #   base URL, response envelope, auth, domains index
    │   └── <feature>.md             #   one per feature (endpoints + DTOs)
    ├── PROJECT-STATUS.md                                     # filled by /init
    ├── decisions/                                            # filled by /init
    ├── srs/                         # created by installer — drop your split SRS excerpts here
    └── plans/                       # created by /plan — one plan doc per feature
```

---

## License

MIT
