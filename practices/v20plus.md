# Angular Best Practices — v20+ (Signal-Native Era)

> Framework-level patterns only. This file describes HOW to write idiomatic
> Angular 20+ — syntax, DI, components, Signals. It does NOT dictate folder
> structure, state-management choice, or naming — those are project decisions
> recorded in `.claude/rules/project-rules.md` (inferred from the codebase).
>
> When the project already follows a correct pattern, follow the project.
> When it is below standard, apply this standard to NEW code only.

---

## Module System
- **Standalone is implicit** — `standalone: true` no longer needs to be written.
  Components, directives, and pipes are standalone by default.
- Bootstrap: `bootstrapApplication(AppComponent, appConfig)`.
- Providers in `app.config.ts` (`provideRouter`, `provideHttpClient`, etc.).
- NgModules are fully legacy — do NOT add new ones.

## Component Pattern
- `ChangeDetectionStrategy.OnPush` everywhere — or **zoneless** (see below).
- **Signal-based APIs are the default** for all inputs, outputs, queries:

```typescript
@Component({
  selector: 'app-user-card',
  imports: [DatePipe],
  templateUrl: './user-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCardComponent {
  // Signal inputs (replaces @Input)
  user = input.required<User>();
  showActions = input(true);           // with default

  // Two-way binding (replaces @Input + @Output pair)
  selectedId = model<number | null>(null);

  // Signal output (replaces @Output + EventEmitter)
  delete = output<number>();

  // Signal queries (replaces @ViewChild / @ContentChild)
  tableRef = viewChild<ElementRef>('table');

  // Derived state
  displayName = computed(() => `${this.user().name} (${this.user().email})`);

  onDeleteClick(): void {
    this.delete.emit(this.user().id);
  }
}
```

- `@Input()` / `@Output()` / `@ViewChild()` still work but are legacy — use signal APIs for all new code.

## Template Syntax
- `@if`, `@else`, `@for` (required `track`), `@switch`, `@defer`, `@empty`, `@placeholder`.
- **`@let`** — declare template-local variables (stable since v18.1):

```html
@let user = currentUser();
@let greeting = 'Hello, ' + user.name;

<h1>{{ greeting }}</h1>

@if (isLoading()) {
  <app-spinner />
} @else {
  @for (item of items(); track item.id) {
    <app-item-card [item]="item" />
  } @empty {
    <app-empty-state />
  }
}

@defer (on viewport) {
  <app-heavy-chart [data]="chartData()" />
} @placeholder {
  <div class="chart-skeleton" />
}
```

## Services & Dependency Injection
- `inject()` everywhere — no constructor injection.
- `@Injectable({ providedIn: 'root' })` for singletons.
- HttpClient ONLY in services; services return `Observable<T>` or use `resource()`.

## HTTP
- `provideHttpClient(withInterceptors([...]))` with functional interceptors.
- **`httpResource()`** for declarative GET requests tied to signals — ⚠️ **experimental in v20** (ready to try, API may change). Use only if the team accepts experimental APIs; otherwise stick to plain HttpClient:

```typescript
// Declarative: auto-refetches when userId signal changes (experimental API)
readonly userResource = httpResource<User>(
  () => `/api/users/${this.userId()}`
);
// userResource.value() → User | undefined
// userResource.isLoading() → boolean
// userResource.error() → unknown
```

- Plain `HttpClient` + `Observable` for mutations (POST/PUT/DELETE) and complex flows.
- Functional interceptors:

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).accessToken();
  return token
    ? next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))
    : next(req);
};
```

## Routing
- `loadComponent()` / `loadChildren()` for lazy loading.
- Functional guards (`CanActivateFn`) and resolvers (`ResolveFn`).
- **Route-level render mode** (SSR): configure per-route in `app.routes.ts` when using SSR.

## Reactive / Signals (signal-native)

Signal primitives:
| API | Purpose | Status (v20) |
|-----|---------|--------------|
| `signal(val)` | Writable state | Stable |
| `computed(() => ...)` | Derived state (memoized) | Stable |
| `effect(() => ...)` | Side effects when signals change | Stable |
| `linkedSignal(() => ...)` | Writable signal derived from another | Stable (graduated in v20) |
| `resource()` / `rxResource()` | Async state (loading/error/value) | ⚠️ Experimental |
| `httpResource()` | HTTP GET tied to signals | ⚠️ Experimental |
| `toSignal(obs$)` | Bridge Observable → Signal | Stable |
| `toObservable(sig)` | Bridge Signal → Observable | Stable |

Rules:
- `computed()` for all derived state — never store redundant computed data in a separate signal.
- `effect()` only for side effects (logging, DOM, third-party libs) — NOT for updating other signals (use `computed` or `linkedSignal` instead). In v20, signal writes inside `effect()` are allowed by default (no `allowSignalWrites`).
- `resource()` / `rxResource()` / `httpResource()` are **experimental** — use for async data only if the team accepts experimental APIs; otherwise use plain HttpClient + Observable. Use plain HttpClient for all mutations regardless.
- Subscriptions (when still needed): `takeUntilDestroyed(inject(DestroyRef))`.

```typescript
export class UserListComponent {
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  // Filter signal drives the resource
  filter = signal('');
  page = signal(1);

  usersResource = httpResource<PaginationResponse<User>>(
    () => `/api/users?page=${this.page()}&search=${this.filter()}`
  );

  userCount = computed(() => this.usersResource.value()?.meta.total ?? 0);
}
```

## Zoneless Change Detection (stable in v20)
- New projects: configure with `provideZonelessChangeDetection()` in `app.config.ts`.
- Existing projects migrating: replace `provideZoneChangeDetection` carefully — test thoroughly.
- In zoneless mode: CD is driven entirely by signals and `markForCheck()`. NEVER rely on `setTimeout`, `Promise.then`, or other macrotask-based CD triggers.
- `async` pipe still works in zoneless mode.

```typescript
// app.config.ts — zoneless
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
```

## Forms
- Reactive Forms (`NonNullableFormBuilder`) for all validated forms.
- **Signal-based forms** (developer preview in v20) — use only if the team opts in explicitly.
- Show validation messages when control is `touched` and `invalid`.

## TypeScript
- No `any`. Signal types are inferred — do not add redundant annotations.
- `interface` for object shapes, `type` for unions/mapped types.
- `readonly` on arrays and objects that must not be mutated.

## Testing
- Unit (service): `provideHttpClientTesting()` + `HttpTestingController`.
- Component: `TestBed` + mock services; assert signal values with `TestBed.flushEffects()` where needed.
- E2E: Playwright.
- Runner: Jest or Web Test Runner / Vitest (Karma is legacy — check what the project uses).

## Security
- Tokens in memory (signal in service) or httpOnly cookie — NOT localStorage.
- No hardcoded backend URL — use `environment`.
- Route guards for all auth-required routes.

---

## What's New vs v18-19

| Feature | v18-19 | v20+ |
|---------|--------|------|
| Signal inputs/outputs | Production-ready (v19) | Default; `@Input`/`@Output` legacy |
| Signals core (`signal`/`effect`/`linkedSignal`) | Stable/preview mix | **All graduated to stable** |
| `linkedSignal()` | Experimental (v19) | **Stable** |
| `httpResource()` / `resource()` / `rxResource()` | Experimental (v19.2+) | ⚠️ **Still experimental** |
| Zoneless CD | Experimental (`provideExperimentalZonelessChangeDetection`) | **Stable** (`provideZonelessChangeDetection`) |
| `effect()` signal writes | Needed `allowSignalWrites` | **Allowed by default** |
| Incremental hydration (`@defer`-powered) | Developer preview (since v17) | **Stable** |
| Signal-based forms | — | Experimental / developer preview |
| `@let` template variables | Stable (since v18.1) | Stable |
| `standalone: true` | Implicit default since **v19** | Implicit default (carried over) |
| Route-level render mode (SSR) | Preview | **Stable** |
