---
name: clarify-request
description: >
  Normalize a vague or underspecified request into a ready-to-paste, Claude-Code-optimized prompt
  that is PRINTED for the user to review/edit — the skill does NOT act on it.
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

> **Ngôn ngữ:** bảng câu hỏi và Brief in ra cho user viết bằng tiếng Việt.

Terse requests like "fix bug A" or "add field X" waste a round-trip when acted on blindly: the
wrong file gets changed, the wrong shape gets assumed, the fix misses the actual symptom. This
skill turns such a request into a **ready-to-paste, Claude-Code-optimized prompt** — filled from
the project first, from the user only for what the project cannot answer — then **prints it for the
user to review, edit, and paste back themselves**. The final output is prompt text, NOT an action:
the skill never edits code, dispatches an agent, or starts a workflow on its own.

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

Ask only the unfilled fields. For any field with a natural small set of choices, ask via the
**`AskUserQuestion`** tool (popup selection, not plain text) — batch multiple fields into as few
calls as the tool allows (max 4 questions per call, 2-4 options each; it always adds an "Other"
choice for free-form input). Fields that are genuinely open-ended (e.g. an exact target path, a
repro description) don't fit fixed options — ask those directly as text, in the same round.
Required fields by intent:

**Common (all intents):** exact target (file/component/feature) · current vs. expected behavior ·
scope + constraints (what must NOT be touched) · done-criteria (how we know it's right).

| Intent | Additional required fields |
|--------|---------------------------|
| **bug** | repro steps · error message/log · since when (after which change?) · which screen/module |
| **feature** | SRS or description · screens in scope · endpoints (already in `docs/api-contracts/<feature>.md`?) · relation to existing features · permissions |
| **small-edit** | data type of the new field · validation rules · where it shows (form / table / both) · does the API already return it |
| **review** | which page/component · concrete symptom (slow on load? scroll? typing?) · expected measure |

If an answer reveals a new ambiguity, ask that one follow-up — don't guess silently, don't drip
every question one at a time.

## Step 4 — Assemble & print the normalized prompt, then STOP

Assemble everything — the original request + what you filled from the project (Step 2) + the
user's answers (Step 3) — into ONE complete, Vietnamese, Claude-Code-ready prompt, and print it
**inside a ` ```text ` fenced block** so the user can copy it in one tap.

The printed prompt follows this template:

1. Opening line `Đọc toàn bộ source code trong thư mục:` + the **verified target path** from Step 2.
2. One sentence stating the overall goal.
3. Numbered sections (1, 2, 3…), one per group of requirements, each with concrete sub-bullets —
   **embed the real file / component / service / endpoint names** discovered in Step 2.
4. A `YÊU CẦU CHUNG` section: follow project conventions (cite `.claude/rules/project-rules.md`,
   `.claude/angular-practices/`, and wrapper priority in `docs/DESIGN_SYSTEM.md`), list what must
   stay untouched, any other constraints, and "liệt kê file đã đổi + tóm tắt sau khi xong".
5. Closing line: `Hãy đọc code trước, xác nhận lại cấu trúc file liên quan với tôi, rồi mới tiến hành.`

For anything the user has not supplied yet (e.g. "interface/API gửi sau"), insert an explicit
placeholder `⚠️ TODO: <mô tả> (tôi sẽ cung cấp sau)` so the user can fill it in themselves.

Skeleton of the block to print:

```text
Đọc toàn bộ source code trong thư mục:
<target path đã verify ở Step 2>

Tôi muốn <mục tiêu tổng quát> theo yêu cầu sau:

1. <NHÓM YÊU CẦU 1>:
   - <chi tiết cụ thể, kèm tên file/component/service thật>
   - ⚠️ TODO: <thông tin user sẽ cung cấp sau>

2. <NHÓM YÊU CẦU 2>:
   - ...

YÊU CẦU CHUNG:
   - Tuân thủ convention/style dự án (.claude/rules/project-rules.md, .claude/angular-practices/,
     ưu tiên wrapper trong docs/DESIGN_SYSTEM.md).
   - Giữ nguyên: <liệt kê phần không đụng tới>.
   - <ràng buộc khác nếu có>.
   - Sau khi sửa xong, liệt kê file đã thay đổi + tóm tắt thay đổi từng file.

Hãy đọc code trước, xác nhận lại cấu trúc file liên quan với tôi, rồi mới tiến hành.
```

Right below the block, print two short lines:
- `✅ Đã điền từ dự án: <what you found and where>`
- `✏️ Cần bạn kiểm tra/bổ sung: <placeholders / open items>`

**Then STOP.** Do NOT dispatch an agent, do NOT run `/plan`, `/dev-cycle`, or `/new-feature`, and
do NOT edit any code. End with: "Copy hoặc chỉnh khối trên rồi dán lại để mình thực hiện."
