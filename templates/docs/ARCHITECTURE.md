# Architecture

> Run `/init` to populate this file from your codebase.

## Overview
{{What this app is, who uses it, which backend it talks to.}}

## Layers
- **core/** — singleton services, HTTP interceptors (auth, error), guards, layout
- **shared/** — reusable presentational components, pipes, directives
- **features/** — business modules (model, service, pages, components)

## Routing & Lazy Loading
{{Route tree, public vs protected routes, lazy loading strategy.}}

## State Management
{{Which approach (Signals / NgRx / BehaviorSubject) and the decision rule.}}

## HTTP & Error Flow
1. Smart component calls a feature service
2. Service issues `HttpClient` request → `Observable<ApiResponse<T>>`
3. Auth interceptor attaches `Authorization: Bearer <token>`
4. Error interceptor handles 401 (refresh/redirect) and maps errors
5. Component renders loading / error / empty / data

## Auth
{{Token storage strategy (memory / httpOnly cookie), refresh flow.}}
