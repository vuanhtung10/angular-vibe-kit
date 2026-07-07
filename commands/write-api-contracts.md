Write or update the API contract documentation for a feature module.

This is the sibling command to `/write-tests`, `/write-context`, `/update-status` — a focused,
single-purpose command that touches **only** the API contract docs (the WHAT). It is decoupled
from `/write-context` (which captures WHY the code is the way it is) and from `/write-tests`
(which exercises the contract's behavior) so each runs at the right moment in your workflow.

If you want the whole bundle (api-contracts + context + tests + status + review) in one gated
pipeline, use `/dev-cycle` instead.

## Inputs
- `{feature}` — feature module name as it appears in `src/` (e.g. `order-management`).

## Pre-flight Checks (run first; abort cleanly if any fails)

**A. Confirm cwd is the Angular project** — read `./package.json` and verify EITHER `@angular/core`
OR `@angular/cli` is a dependency. If not, print and STOP:

```
❌ cwd `<absolute cwd>` không phải Angular project (no @angular/core or @angular/cli in
package.json). Hãy `cd <your-angular-app>` rồi gõ lại.
```

**B. Confirm `/init` has populated `docs/api-contracts/`** — read `docs/api-contracts/README.md`:
- If the file is missing entirely OR still contains `{{` placeholders → STOP with:

  ```
  ❌ docs/api-contracts/README.md chưa được fill bởi /init. Hãy chạy /init trước để:
     - tạo <cwd>/docs/api-contracts/ (nếu chưa có)
     - điền Base URL, Response Envelope, Auth sections từ code thật
     Sau đó gõ lại:  /write-api-contracts <feature>
  ```

- This is non-negotiable: this command **only updates** the per-feature file and the Domains
  row — it does NOT fill project-wide sections (Base URL / Response Envelope / Auth). Those
  belong to `/init`. If they're missing, attempting to honor "Auth = default Yes" rules blindly
  would silently bake in wrong project-wide behavior.

**C. Confirm the feature's service file exists** — Glob for `**/{feature}*.service.ts` OR
`**/{feature}/services/*.service.ts`. If none found, ask ONE question: "Đường dẫn feature trong
`src/`? Tên có thể khác với `{feature}` bạn đã gõ — cho biết để tôi chỉnh Glob."

After all three checks pass, move on to **Behavior** below.

## Behavior
1. **Locate or create the per-feature file**:
   - Read `docs/api-contracts/{feature}.md`. If present, **merge** — keep user edits, update
     section-by-section. Never silently overwrite.
   - If absent, create from the per-feature template at the bottom of this file.
2. **Read the source**:
   - Find the feature's service file via Glob (e.g. `**/{feature}*.service.ts` or
     `**/{feature}/services/*.service.ts`). Read the whole file.
   - Find the matching model interface(s) via Glob (e.g. `**/{feature}*.model.ts`,
     `**/{feature}/models/*.model.ts`).
   - If multiple services exist (e.g. split data + auth), read them all.
3. **Extract the contract from code** — never invent:
   - HTTP method (GET / POST / PUT / PATCH / DELETE)
   - URL path (relative to `environment.baseUrl`)
   - Request shape (DTO, in/out params)
   - Response shape (DTO + how the envelope is unwrapped, if applicable — read
     `docs/api-contracts/README.md` Response Envelope section for the project's convention)
   - Auth requirement — default Yes (Bearer token). Mark Public only if the endpoint is
     explicitly marked Public in the README.md Auth section.
4. **Write the file** using the per-feature template below. Skip sections with no data (don't pad
   with placeholder text). Group endpoints by service if there are multiple services.
5. **Update `docs/api-contracts/README.md`**:
   - Add a row to the Domains table (under the `## Domains` heading) if the feature file is new.
   - If the row already exists, update the Service column if it changed.
   - Never edit the `Base URL`, `Response Envelope`, or `Auth` sections — those are project-wide
     once filled by `/init`; if they're missing or wrong, tell the user to run `/init` first.
6. **Print summary**:
   ```
   ✅ write-api-contracts: <feature>
     - File : docs/api-contracts/<feature>.md (<updated | created>)
     - Endpoints written: <N>
     - Index updated : <yes/no>

   Discrepancies surfaced (ask before fixing):
     - 2 endpoints in code not in existing docs (added)
     - 1 endpoint in docs but no matching call in code (proposed removal — NOT applied)
   ```

## Per-feature File Template

```markdown
# API Contract — {Feature Name}

> Last updated: {YYYY-MM-DD} by `/write-api-contracts {feature}`
> Source service(s): `{path to service.ts}`, ...

## Endpoints

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET    | `/api/{feature}`       | List (paginated) | Yes |
| GET    | `/api/{feature}/:id`   | Detail           | Yes |
| POST   | `/api/{feature}`       | Create           | Yes |
| PUT    | `/api/{feature}/:id`   | Update           | Yes |
| DELETE | `/api/{feature}/:id`   | Remove           | Yes |

## Request DTOs

```typescript
interface Create{Feature}Request {
  // inferred from service call args
}
```

## Response DTOs

```typescript
interface {Feature} {
  id: string;
  // inferred from response type
}
```

## Error Cases

| Status | When |
|--------|------|
| 400 | Validation failure (DTO schema mismatch) |
| 401 | Missing / expired token |
| 403 | User lacks required scope |
| 404 | {Feature} not found |
| 409 | Conflict (e.g. duplicate field) |
| 500 | Server error — surface "Try again" toast |

## Notes
- Inconsistencies between code and prior docs (list here)
- Out-of-scope assumptions made during extraction
- Untyped responses flagged for manual review
```

## Rules
- **Source-of-truth pulls from code**, not assumptions. If `service.ts` calls a URL the docs
  don't list, ADD it; if a URL is in the docs but not in code, SURFACE it for user review —
  do not silently delete.
- **DTO inference**: use the TypeScript types in `models/{feature}.model.ts` as the schema.
  If types are missing or `any`, flag in the Notes section: "Missing types — verify manually".
- **Auth column**: default Yes. Only mark Public if explicitly listed in
  `docs/api-contracts/README.md` Auth section.
- **Never edit `Base URL` / `Response Envelope` / `Auth` sections** of the README — they are
  project-wide and owned by `/init`. If they look wrong, redirect the user there.
- **No new authorization rules invented here** — copy from existing service interceptor patterns.
- The kit's shared assumption is: "**docs and code in the same commit** — docs that lag behind
  code go stale." Run this command before committing if endpoints changed.

## Related
- `/write-tests {feature}` — tests the contract's behavior.
- `/write-context {feature}` — captures the WHY behind the design.
- `/update-status` — bumps the session counter to record the change.
- `/review-pr` — flags a doc-vs-code drift if this file was missed in a feature commit.
- `/dev-cycle {feature}` — runs tests + review + this docs update automatically as part of
  its Phase 5 wrap-up.
