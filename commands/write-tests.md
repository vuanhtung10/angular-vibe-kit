Write tests for the specified feature module. Read the source code first, then generate tests.

Use the test runner the project already uses (Jest or Karma/Jasmine — check
`package.json` / `angular.json`). Read `.claude/angular-practices/` for the
version's testing idioms.

## Step 1: Read Before Writing
- Read the feature's source: model, service, page components, presentational components
- Read the module's `CONTEXT.md` (if it exists) to understand trade-offs and edge cases
- Read `docs/API_CONTRACT.md` for expected request/response shapes
- Identify all code paths: happy path, error cases, empty states, validation

## Step 2: Unit Tests — `{feature}.service.spec.ts`

Use `HttpClientTestingModule` + `HttpTestingController` (works on every version, v12+).
On v15+ you may instead use the functional `provideHttpClient()` + `provideHttpClientTesting()`.
Follow whichever style the project already uses (see `.claude/angular-practices/`).

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

### Required Coverage Per Method
**getAll:**
- ✅ Success — returns list; assert request URL + method `GET`
- ✅ Empty — returns empty array, not null
- ✅ Server error — propagates error (500)

**getById:**
- ✅ Found — returns correct response; assert URL contains the id
- ✅ Not found — 404 error propagated

**create:**
- ✅ Success — assert `POST` + request body matches payload
- ✅ Validation error — 400
- ✅ Conflict — 409

**update:**
- ✅ Success — assert `PUT`/`PATCH` + body
- ✅ Not found — 404

**delete:**
- ✅ Success — assert `DELETE` + URL
- ✅ Not found — 404

### Unit Test Rules
- Use `httpMock.expectOne(url)` to assert and flush each request
- Test ONE behavior per test
- Naming: `methodName_scenario_expectedResult`
- Describe behavior in the test title, not the implementation
- `httpMock.verify()` in `afterEach` — no unexpected requests
- Never hit a real backend

## Step 3: Component Tests — `{feature}-list.component.spec.ts`

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

### Required Coverage
- ✅ Render — list shows correct data after load
- ✅ Loading — spinner visible while the request is pending
- ✅ Error — error message visible when the service errors
- ✅ Empty — empty-state message when no data
- ✅ Interaction — clicking delete calls `service.delete` with the right id
- ✅ Signals (v16+) — assert signal values update as expected

### Component Test Rules
- Mock the service — never the real HttpClient
- Drive change detection with `fixture.detectChanges()`
- Query the DOM via `fixture.nativeElement` / `DebugElement`
- Each test is independent — no shared mutable state

## Step 4: E2E (only for critical flows)
For login and the main CRUD flow, add a Playwright spec under the project's e2e folder.
Skip E2E for trivial pages — manual testing covers those.

## Step 5: Verify
- All tests pass: `ng test` / `jest`
- No test depends on execution order
- No unit test hits a real backend
- Test names clearly describe WHAT is tested and the EXPECTED result
- Coverage: every public service method has at least happy path + error case
