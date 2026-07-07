# API Contracts — Index

> Endpoints the frontend calls, grouped by feature/domain — one file per feature under
> `docs/api-contracts/<feature>.md`. Run `/init` to populate from existing service files.
>
> - **New endpoint on an existing feature?** Edit that feature's file only — this index
>   doesn't change.
> - **New feature?** Create `docs/api-contracts/<feature>.md` and add a row to the Domains
>   table below.

## Base URL
```
Development: {{from environment.ts}}
Production:  {{from environment.prod.ts}}
```

## Response Envelope
```typescript
interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
}

interface PaginationResponse<T> {
  meta: { page: number; pageSize: number; pages: number; total: number };
  result: T[];
}
```

## Auth
All endpoints require `Authorization: Bearer <accessToken>` except those marked **Public**.

---

## Domains

| Feature | File | Service |
|---------|------|---------|
| {{Feature}} | [{{feature}}.md](./{{feature}}.md) | `{{Feature}}Service` |

> Run `/init` to fill this table from your actual feature folders — one row per feature
> that has its own `docs/api-contracts/<feature>.md`.
