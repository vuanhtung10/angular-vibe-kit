Write tests for the specified feature module.

Follow `.claude/references/test-spec.md` — it is the single source of truth for how this project writes
tests: read-first, service unit tests (TestBed + `HttpTestingController`), component tests, E2E for
critical flows only, and the verify step (coverage ≥ 80%, no real backend). It detects the project's
runner (Jest or Karma/Jasmine) and version idioms from `.claude/angular-practices/`.

Write the tests **inline** in this conversation, then run them and report the result (files created,
what each covers, pass/fail + coverage).

> For a large feature, or to write tests in the background while you keep coding, dispatch the
> `angular-test-writer` agent instead — it follows the same spec in an isolated context.
