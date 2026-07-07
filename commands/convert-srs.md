Convert any non-Markdown SRS source (PDF, DOCX, PPTX, XLSX, image with text, ZIP, EPub, …)
into one or more Markdown files under `docs/srs/`, indexed in `docs/srs/README.md`, ready for
`/plan <feature>` to consume.

This command wraps **Microsoft Markitdown** (https://github.com/microsoft/markitdown) — a Python
utility specifically tuned for LLM-friendly Markdown output (preserves headings, lists, tables, image
links). It is *installed on the user's dev machine only* (not in the Angular project). If the binary
is not on PATH, the command STOPS and prints a one-line install hint — it never touches
`package.json`.

Markitdown vs. pandoc (the older README suggestion):
- Markitdown handles PDF, PPTX, XLSX, and image OCR out of the box; pandoc is mediocre at all four.
- Markitdown output is token-optimized for LLMs; `docs/srs/<file>.md` consumers (`/plan`, `/init`)
  read it directly.
- For DOCX-only round-trips, either tool works — prefer Markitdown for consistency.

> Requires **Python 3.10+** and the **`markitdown[all]`** CLI on PATH. On Windows the easiest setup
> is `winget install astral-sh.uv` → `uv tool install "markitdown[all]"`. The command below
> auto-detects whichever installer you used.

---

## THE GATE RULE (applied at Phase 3 only)

After Phase 3 (multi-module detection), if the command splits the input, you MUST:
1. Print the planned split (each detected module + proposed filename).
2. Ask **"✅ Split as proposed? (yes / edit / cancel)"**.
3. WAIT. Do not split on assumption.

The remaining phases are non-interactive — once the split is confirmed (or the input is single-module),
the command runs straight through to handoff. There is only one human decision: the split plan.

---

## Phase 0 — Probe (no gate)

0. **Confirm cwd is the Angular project** — read `./package.json` and check that EITHER
   `@angular/core` (preferred) OR `@angular/cli` is a dependency. If neither is present:
   - Print and STOP (do not proceed to any later step):

     ```
     ❌ cwd `<absolute cwd>` không phải Angular project (no @angular/core or @angular/cli in
     package.json). Hãy `cd <your-angular-app>` rồi gõ lại.
     ```

   - This is non-negotiable: without it, output MD would land in the wrong `docs/srs/` (e.g. in
     `C:\Users\<you>\docs\srs\` instead of `<your-project>\docs\srs\`).

1. **Confirm or create `docs/srs/`** — read `./docs/srs/README.md`:
   - If absent entirely → create `./docs/srs/` from the kit template at
     `templates/docs/srs/README.md` (read it, write it verbatim), then continue. Note in output:
     `[convert-srs] Created ./docs/srs/ from kit template (project had no docs/srs/ yet — was /init run?)`.
   - If present but contains `{{` placeholders (untouched kit template) → warn once but keep
     the file; Phase 4 will append a real row below the placeholder sections:
     `[convert-srs] Note: docs/srs/README.md still has unfilled kit placeholders — run /init later to clean up.`
   - If present and already has user content → preserve it; Phase 4 will merge the new row in
     without disturbing existing entries.

2. **Confirm `markitdown` is on PATH** — run `markitdown --version` via Bash.
   - **Not installed** → print EXACTLY this and stop:

     ```
     ❌ markitdown chưa được cài. Cài bằng 1 lệnh:

         # Windows (recommended — uv tự quản Python + venv)
         winget install astral-sh.uv
         uv tool install "markitdown[all]"

         # macOS / Linux
         pip install 'markitdown[all]'
         # or:   uv tool install 'markitdown[all]'

         # Docker (nếu đã có Docker Desktop)
         docker run --rm -i mcr.microsoft.com/markitdown:latest < spec.pdf > out.md

     Sau khi cài xong, gõ lại:  /convert-srs <file>
     ```

   - **Installed but not in PATH** → same message, mention checking the install location.

3. **Confirm the input file path** (provided by the user as the slash command argument, or picked
   from the working dir if run bare). If neither exists, ask one question: "Đường dẫn file SRS?"

---

## Phase 1 — Detect

1. Read the file extension and size. Print:
   ```
   [convert-srs] Input : <basename>.<ext>  (<size> KB)
   [convert-srs] Backend: <chosen backend>
   ```
2. **Choose backend** — see Decision Table below. Default to built-in; only mention Azure / OCR when
   the built-in likely fails (PDF scan, image-only, scanned DOCX). The user can override with a flag
   in the slash argument: `/convert-srs file.pdf --use-cu` or `/convert-srs --use-ocr`.

   | File kind | Detection signal | Default backend | Warn / suggest |
   |-----------|------------------|-----------------|----------------|
   | `.docx`   | any | built-in | — |
   | `.pdf`    | has text layer | built-in | if **no** text layer (all whitespace pages): suggest `pip install markitdown-ocr` |
   | `.pptx`   | any | built-in | — |
   | `.xlsx`, `.xls` | any | built-in | — |
   | `.html`, `.htm` | any | built-in | — |
   | `.csv`, `.json`, `.xml` | any | built-in | — |
   | `.zip`    | any | built-in (iterate) | list contents, ask which to convert if many |
   | image (`.png .jpg .jpeg .gif .bmp .webp`) | any | built-in (EXIF + OCR) | if EXIF empty: suggest `--use-llm` for LLM Vision |
   | audio (`.wav .mp3`) | any | built-in (transcription) | if no API key: warn that transcription is offline-only / disabled |
   | `youtube.com` / `youtu.be` URL | in argv | built-in (transcript fetch) | requires internet |
   | `.epub`   | any | built-in | — |

3. **Print chosen backend** and any non-default option flags.

---

## Phase 2 — Convert

1. Run markitdown:
   ```bash
   markitdown "<input>" -o docs/srs/_tmp_in.md
   ```
   Use the appropriate flag if the user passed `--use-cu` / `--use-llm` / `--use-ocr` / `--list-plugins`.
2. **Stream failures gracefully** — if markitdown exits non-zero:
   - show the last 20 lines of stderr
   - if it was an Azure backend that wasn't configured, fall back to built-in and re-run with a
     one-line notice: `[convert-srs] Azure backend not configured — fell back to built-in.`
3. After success, print a one-liner:
   ```
   [convert-srs] Markdown written: docs/srs/_tmp_in.md  (<lines> lines, <kb> KB)
   ```

---

## Phase 3 — Detect modules & split (GATE)

1. Read `docs/srs/_tmp_in.md` (use Read with offset for large files).
2. **Count modules** by counting H1 (`# `) headings. Detect the project by name (longest heading text on
   the first ~50 lines, OR a `%MODULENAME%` token, OR the input filename's stem).
3. **One module (or zero H1s)** → treat the whole file as one feature.
   - Proposed filename: `docs/srs/<kebab-case-detected-name>.md` (fallback: input file stem).
   - **Skip the GATE**, go straight to Phase 4.
4. **Multiple modules (≥ 2 H1s)** → enter split mode.
   - **Propose one file per H1**, keeping sub-headings under the H1 in the same file.
   - Derive each filename by kebab-casing the H1 text. Strip noise (`# `, leading numbers like `5.`).
   - **GATE:** print the planned split table and wait:

     ```
     [convert-srs] Detected 4 modules — proposed split:

     | # | H1                                  | Proposed file                       |
     |---|-------------------------------------|--------------------------------------|
     | 1 | Module 5 — Order Management          | docs/srs/module-5-order-management.md |
     | 2 | Module 6 — Invoicing                | docs/srs/module-6-invoicing.md        |
     | … | …                                   | …                                      |

     ✅ Split as proposed? (yes / edit / cancel)
       - yes    → proceed
       - edit   → tell me which row(s) to merge / rename / drop
       - cancel → keep the unsplit file (rename to docs/srs/<stem>.md), continue
     ```

5. After yes:
   - For each row, write that H1 + its descendants into the proposed file. Preserve the YAML front
     matter / image refs from the original.
   - For images: markitdown places them under an `_images/` folder next to the markdown — keep
     relative refs, do NOT rename.

---

## Phase 4 — Save & index

1. **Cleanup the temp file** `docs/srs/_tmp_in.md` after the split (or after Phase 3's copy step
   when the input is single-module).
2. **Create `docs/srs/_images/`** if any images were extracted (preserve path structure from the
   convert step).
3. **Update `docs/srs/README.md`** — read the existing index, add the new row(s) at the top of the
   file list, preserving any user-edited content. Match the existing convention (look at the
   `## Convention` block in the template).
   - New row format: `- <basename>.md  — <one-line description inferred from H1 or first paragraph>`
   - If the file doesn't exist yet, create it by copying the kit's `templates/docs/srs/README.md`
     then appending the new row.

---

## Phase 5 — Handoff

Print a single completion block:

```
✅ convert-srs complete
   - Files added : <list, one per line>
   - Image refs  : <count> (in docs/srs/_images/)
   - Index updated: docs/srs/README.md

Next step:
   /plan
   Đọc yêu cầu từ docs/srs/<kebab-case>.md
```

Then **wait** for the user to either run `/plan` or ask a question.

---

## Failure modes (handled in place)

| Situation | Handling |
|-----------|----------|
| `markitdown` missing | Phase 0 stops with the install hint above. |
| `markitdown` exits non-zero (corrupt / encrypted PDF, unsupported codec) | Show last 20 lines of stderr, suggest `--use-ocr` or `--use-cu` for scanned PDFs. |
| File is empty after convert | Print the empty size, ask: "File rỗng — có phải scan không? (y / n)". If yes, suggest OCR / Azure. |
| Split produces a file that already exists | Confirm before overwriting: "File `<path>` đã tồn tại — ghi đè? (yes / merge / rename / skip)". |
| `docs/srs/` not yet created | Create it from `templates/docs/srs/README.md` before writing. |
| User runs `/convert-srs` with no argument and nothing relevant in cwd | Ask one question: "Đường dẫn file SRS? (kéo thả file vào cửa sổ terminal nếu cần)". |
| Input is a remote URL (YouTube / http) | Built-in handles YouTube transcripts; for HTTP, run `markitdown <url> ...` directly. Confirm before fetching. |

---

## Notes
- This command is **deterministic + document-only** — it never modifies application source code
  (`src/`). It only writes into `docs/srs/`. Safe to run anytime.
- It is the ONLY command that requires a tool outside the Node ecosystem. Everything else in the
  kit works with what `package.json` already declares. Don't add markitdown to the Angular
  project's `devDependencies`.
- If the user has already split a multi-feature SRS manually (one Word doc per module), run
  `/convert-srs` **once per file**, or pass a glob: not currently supported — call it once per file.
