---
name: srs-ingest
description: >
  Detect when the user has an upstream SRS, spec, mockup, or requirements document that needs to
  be brought into the kit as a Markdown source under `docs/srs/`. Use when the user mentions a
  non-Markdown source (PDF, Word .docx, PowerPoint, Excel, screenshot, audio, YouTube link, EPub,
  ZIP, image), or describes a workflow like "PM gửi file", "SRS dạng PDF", "convert cái này sang
  MD", "đẩy spec vào dự án", "I have a spec in Word/PDF/PPT", "ingest this for me", or asks "làm
  sao đưa file này vào kit?". If the user already types `/convert-srs`, do NOT pre-empt — that
  command itself runs the same flow.
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
---

# SRS Ingest — guide the user to `/convert-srs`

The kit's SRS workflow assumes requirements arrive as one or more **Markdown files under
`docs/srs/<feature>.md`**, where `/plan` and `/init` read them. Reality is messier — PMs send
Word docs, BSE specs arrive as PDFs, kickoff decks live in PowerPoint, mapping tables are
Excel, and screenshots have text that needs OCR. The `/convert-srs` command handles the
mechanical part (runs Markitdown, splits multi-module sources, indexes them). This skill
detects the *intent to bring a non-Markdown source into the kit* and points the user there.

## What this skill does (and does NOT)

| Does | Does NOT |
|------|---------|
| Detects "I have an SRS in <format>" mentions | Run the actual conversion |
| Asks one clarifying question (file path / format) | Modify `package.json` or `src/` |
| Hands off to `/convert-srs` (or to manual `markitdown` for power users) | Touch `docs/srs/` directly |
| Stays project-agnostic — no UI library / state assumption | Assume Python is installed (the command probes for it) |

## First action — file in the gap, then hand off

1. **Quick probe**: is `markitdown` on PATH? (One short Bash call.)
   - If **yes** → proceed.
   - If **no** → say once: *"Markitdown chưa cài. Hướng dẫn 1 lệnh trên Windows:
     `winget install astral-sh.uv` rồi `uv tool install "markitdown[all]"`."* Let the user decide.
     Don't run installation yourself — that's the user's call on a global Python tool.

2. **Ask one batched question** (multiple-choice where possible):
   - Đường dẫn file? (người dùng có thể paste/kéo thả)
   - File chứa 1 feature hay nhiều feature?
   - Format là gì? (nếu user chưa nói)

3. **Pre-check `docs/srs/`** — does it exist? Are there existing files (so we don't clobber names)?
   Read `docs/srs/README.md` once if it exists, to honor any project-specific index convention.

4. **Hand off** to `/convert-srs` with the resolved path:
   ```
   /convert-srs <resolved-path>
   ```
   If the user prefers to run markitdown manually (rare), explain the one-liner:

   ```bash
   markitdown path/to/spec.docx -o docs/srs/<kebab-name>.md
   # remember to update docs/srs/README.md's index yourself
   ```

## Triggers — phrases that activate this skill

Match any of these (the description is already configured for common variants — these are
additional concrete examples the model can lean on):

```
"PM vừa gửi file Word đặc tả"
"tôi có spec PDF, làm sao đưa vào kit?"
"convert file Excel này sang MD"
"file PowerPoint này là SRS, ingest giúp"
"có screenshot trang spec, lấy text ra"
"YouTube này là video spec, extract transcript"
"đẩy SRS .docx vào docs/srs"
"cái này là yêu cầu của khách hàng từ PDF"
```

## Anti-triggers — do NOT activate when

- User typed `/convert-srs` directly → the command runs the flow; this skill stays quiet.
- User is asking **about** an existing `docs/srs/*.md` file (explain why, not ingest).
- Source is already Markdown / text / clipboard.
- User wants to commit/format/render existing docs (different workflow).
- Intent is "I want to write a brand-new spec from scratch" (no source to ingest).

## Handoff line

After probing + asking, say exactly this once and let the user confirm:

> *"Để đưa `<basename>` vào `docs/srs/`, gõ:  `/convert-srs <path>`  — tôi sẽ tự convert, split nếu multi-module, và cập nhật index."*

If the user prefers manual: print the `markitdown` one-liner above.

## Rules

- **One question batch, then hand off.** Don't get into a long interview — the conversational
  trigger is enough to point at the command.
- **Never auto-run markitdown** from this skill — `/convert-srs` owns that. This skill only
  detects intent and hands off.
- **Never modify `docs/srs/`** from this skill — let the command handle that path entirely.
- **Bilingual fallback** — keep the message in Vietnamese by default (matches this project's
  Commit Convention language per `.claude/rules/project-rules.md`); allow English if the user
  writes in English.
