# Angular Test Spec (shared source of truth)

> Read by BOTH `/write-tests` (command, runs inline) and the `angular-test-writer` agent (isolated).
> Keep test logic HERE only — the command and the agent are thin wrappers around this file.

## Load the project's standards first
- `.claude/angular-practices/*.md` → the **Testing** section (version's `TestBed` idioms).
- `.claude/rules/project-rules.md` + an existing spec (the Reference Example) — mirror its style.
- Detect the runner from `package.json` / `angular.json` / `jest.config` / `karma.conf`
  (Jest or Karma/Jasmine). Use what the project already uses — never introduce a new runner.

## Step 1: Read before writing
- Read the feature's source: model, service, page components, presentational components, guards, pipes, resolvers.
- Read the feature's `CONTEXT.md` (if present) for trade-offs and edge cases.
- Read `docs/API_CONTRACT.md` for expected request/response shapes.
- Identify every code path: happy path, not-found, validation failure, loading/error/empty states, branches.

## Step 2: Service unit tests — `{feature}.service.spec.ts`
Use `HttpClientTestingModule` + `HttpTestingController` (works v12+). On v15+ you may use the functional
`provideHttpClient()` + `provideHttpClientTesting()` — follow whichever style the project already uses.

```typescript
describe('{Feature}Service', () => {
  let service: {Feature}Service;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{Feature}Service],
    });
    service = TestBed.inject({Feature}Service);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());
});
```

### Required coverage per method
- **getAll**: success (returns list; assert URL + `GET`) · empty (empty array, not null) · server error (500 propagates)
- **getById**: found (assert URL contains id) · not found (404 propagates)
- **create**: success (assert `POST` + body matches payload) · validation error (400) · conflict (409)
- **update**: success (assert `PUT`/`PATCH` + body) · not found (404)
- **delete**: success (assert `DELETE` + URL) · not found (404)

### Service test rules
- Use `httpMock.expectOne(url)` to assert and flush each request.
- One behavior per test. Naming: `methodName_scenario_expectedResult`.
- `httpMock.verify()` in `afterEach` — no unexpected requests. Never hit a real backend.

## Step 3: Component tests — `{feature}-list.component.spec.ts`
Mock the service with `jasmine.createSpyObj` (Karma) or `jest.fn()` (Jest).

```typescript
describe('{Feature}ListComponent', () => {
  let fixture: ComponentFixture<{Feature}ListComponent>;
  let serviceSpy: jasmine.SpyObj<{Feature}Service>;

  beforeEach(() => {
    serviceSpy = jasmine.createSpyObj('{Feature}Service', ['getAll', 'delete']);
    TestBed.configureTestingModule({
      imports: [{Feature}ListComponent],
      providers: [{ provide: {Feature}Service, useValue: serviceSpy }],
    });
  });
});
```

### Required coverage
- Render (list shows correct data after load) · Loading (spinner while pending) · Error (message on service error)
  · Empty (empty-state message) · Interaction (clicking delete calls `service.delete` with the right id)
  · Signals (v16+): assert signal values update as expected.

### Component test rules
- Mock the service — never the real HttpClient.
- Drive change detection with `fixture.detectChanges()`; query DOM via `fixture.nativeElement` / `DebugElement`.
- Each test independent — no shared mutable state.

## Step 4: E2E (only for critical flows)
For login and the main CRUD flow, add a spec under the project's e2e folder using its configured E2E
tool (e.g. Playwright). Skip E2E for trivial pages — manual testing covers those.

## Step 5: Verify before reporting
- All new tests pass (`ng test --watch=false` / `npm test` / `jest`, or target the new spec).
- No test depends on execution order; no unit/component test hits a real backend.
- Test names describe behavior and the expected result.
- Coverage ≥ 80% for the feature (`ng test --code-coverage` / `jest --coverage` if configured);
  every public service method has at least happy-path + error case.

## Output
List the spec files created, what each covers, and the final test-run result (pass/fail + coverage).
