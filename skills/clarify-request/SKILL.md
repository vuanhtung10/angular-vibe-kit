---
name: clarify-request
description: >
  Normalize a vague or underspecified request into a standard brief BEFORE acting on it.
  Use when the user asks for work with missing context — e.g. "fix bug A" (no repro/error),
  "thêm tính năng B" / "add feature B" (no scope), "sửa cho tôi", "thêm trường X vào component Y"
  (no data type / validation / API info), "kiểm tra hiệu suất" / "check performance" (no target or
  symptom), "làm cho tôi cái này" — any coding request where the target, expected behavior, scope,
  or done-criteria are unclear. Do NOT use when the request is already specific, when it is a pure
  question (use explain), or when already inside a /plan, /dev-cycle, or /new-feature flow (those
  have their own clarify phases).
allowed-tools:
  - Read
  - Glob
  - Grep
---

# Clarify Request (prompt normalizer)

Terse requests like "fix bug A" or "add field X" waste a round-trip when acted on blindly: the
wrong file gets changed, the wrong shape gets assumed, the fix misses the actual symptom. This
skill turns such a request into a **standard brief** — filled from the project first, from the
user only for what the project cannot answer — then routes it to the right workflow.

## When NOT to trigger (check first)

Skip this skill entirely when:
- The request already names the exact target AND the expected outcome AND its constraints.
- It is a pure question ("why...", "explain...", "how does...") → the **explain** skill owns that.
- You are already inside `/plan`, `/dev-cycle`, `/new-feature`, or `/init` — their own phases
  (Phase B, Phase 0, Step 1, Stage 1) do the clarifying; do not stack a second layer.
- The user explicitly says to just do it ("cứ làm đi", "just do it", "no questions") — then fill
  gaps from the project, state your assumptions in one line each, and proceed.

## Step 1 — Classify the intent

| Intent | Signals |
|--------|---------|
| **bug** | "fix", "lỗi", "bug", "không chạy", "sai", an error message pasted |
| **feature** | "thêm tính năng", "add feature", an SRS/spec mentioned, a new screen/module |
| **small-edit** | "thêm trường/cột", "đổi label", "ẩn nút", a single component/file named |
| **review** | "kiểm tra", "review", "tối ưu chưa", "hiệu suất", "check" |

## Step 2 — Fill from the project BEFORE asking anything

Never ask what the project already answers. Look here first:

| Missing info | Where to look |
|--------------|---------------|
| Which file/component is "X" | `Glob`/`Grep` for the name; feature folders; `docs/ARCHITECTURE.md` |
| Does the API return that field | `docs/api-contracts/<feature>.md`, the feature's `services/*.ts` + `models/*.ts` |
| Which wrapper to use for new UI | `docs/DESIGN_SYSTEM.md` → Wrapped Components table |
| Project conventions / do-not-touch | `.claude/rules/project-rules.md` (Precedence, Coexistence) |
| What was recently worked on (bug context) | `docs/PROJECT-STATUS.md`, `git log` if permitted, feature `CONTEXT.md` |
| Version idioms for the change | `.claude/angular-practices/` |

## Step 3 — Ask ONE batched set of what's still missing

Ask only the unfilled fields via the **AskUserQuestion** tool, all in one batch (up to 4 questions
per call — split into consecutive calls if there are more), multiple-choice wherever the answer
space is bounded. Only fall back to a plain chat question for a field that is genuinely open text
(e.g. an error message, a free-form description) — AskUserQuestion needs 2–4 concrete options, so
don't force one where there isn't a real choice.
Required fields by intent:

**Common (all intents):** exact target (file/component/feature) · current vs. expected behavior ·
scope + constraints (what must NOT be touched) · done-criteria (how we know it's right).

| Intent | Additional required fields |
|--------|---------------------------|
| **bug** | repro steps · error message/log · since when (after which change?) · which screen/module |
| **feature** | SRS or description · screens in scope · endpoints (already in `docs/api-contracts/<feature>.md`?) · relation to existing features · permissions |
| **small-edit** | data type of the new field · validation rules · where it shows (form / table / both) · does the API already return it |
| **review** | which page/component · concrete symptom (slow on load? scroll? typing?) · expected measure |

If an answer reveals a new ambiguity, ask that one follow-up (via AskUserQuestion if it has a
bounded answer set, plain text otherwise) — don't guess silently, don't drip every question one
at a time.

## Step 4 — Print the brief, then route

Print the normalized brief so the user can correct it at a glance:

```markdown
📋 **Brief**
- Type: <bug | feature | small-edit | review>
- Target: <exact file/component/feature path>
- Current → Expected: <one line>
- Scope: <in> / NOT: <out>
- Done when: <criteria>
- Filled from project: <what you found and where>
- From user: <their answers>
```

Then route — do not reinvent workflows this kit already has:

| Type | Route |
|------|-------|
| **feature** (multi-screen / multi-endpoint) | Suggest `/plan` → `/dev-cycle`; small single-screen feature may go straight to `/new-feature` |
| **bug** (non-trivial / runtime) | Dispatch the **angular-debugger** agent; trivial one-liners fix directly |
| **small-edit** | Do it directly, following the brief + `.claude/angular-practices/` + wrapper priority |
| **review** | Run `/review-pr` inline, or dispatch **angular-reviewer** for a large diff; performance-scoped review states the symptom + target from the brief |

One confirmation, not two: if the brief is complete and the route is obvious, state both and
proceed — don't ask "is the brief OK?" and then "should I start?" as separate gates.
