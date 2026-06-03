# API Contract

> Endpoints the frontend calls, mapped to Angular services.
> Run `/init` to populate from existing service files.
> Update whenever a service starts calling a new/changed endpoint.

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

## {{Feature}} — `{{Feature}}Service`

| Method | Endpoint | Service method |
|--------|----------|----------------|
| GET | `/{{path}}?page=&size=` | `getAll(params)` |
| GET | `/{{path}}/:id` | `getById(id)` |
| POST | `/{{path}}` | `create(payload)` |
| PUT | `/{{path}}/:id` | `update(id, payload)` |
| DELETE | `/{{path}}/:id` | `delete(id)` |

```typescript
interface {{Feature}} { /* mirror backend DTO */ }
interface Create{{Feature}}Request { /* ... */ }
interface Update{{Feature}}Request { /* ... */ }
```
