# ADR 002: Auth Token Storage & Refresh

> Status: Accepted | Date: {{YYYY-MM-DD}}

## Context
{{JWT auth. Token storage has security implications (XSS vs CSRF).}}

## Options Considered
- **In-memory** — safest vs XSS; lost on page refresh
- **httpOnly cookie (refresh token)** — not JS-readable, pairs with in-memory access token
- **localStorage** — vulnerable to XSS; avoid for tokens

## Decision
{{Access token in memory. Refresh token in httpOnly cookie.
401 → interceptor calls /auth/refresh → retry original request → on failure logout.}}

## Implementation Pointers
- Auth interceptor: `core/.../auth.interceptor.ts`
- Token state: `core/auth/auth.service.ts`
