# 0003. MSW for Mocking and Integration Tests

Status: Accepted
Date: 2026-08-24

## Context

No backend existed yet during frontend development, but the app still
needed to be developed and tested against realistic data and network
behavior (loading states, errors, successful mutations updating the UI).
Mocking individual functions/modules (e.g. `vi.mock('../api/todosApi')`)
verifies a hook is wired correctly, but doesn't prove that a full page,
with real hooks and a real `QueryClient`, actually works end to end.

## Decision

Use Mock Service Worker (MSW) to intercept requests at the network level,
both in the browser (`msw/browser`, dev-only, gated behind
`import.meta.env.DEV`) and in tests (`msw/node`). Each feature owns its own
handlers (`api/<feature>Api.handlers.ts`), colocated with the feature they
mock, following the same "everything a feature needs lives inside it"
principle as the rest of the architecture. Handlers are aggregated into a
single server instance in `src/test/server.ts` for tests, and a single
worker in `src/test/browser.ts` for local dev.

Test lifecycle: `server.listen({ onUnhandledRequest: 'error' })` before all
tests, `server.resetHandlers()` after each test, `server.close()` after
all — ensuring per-test handler overrides (e.g. simulating a failure) never
leak into other tests, and any request MSW has no handler for fails the
test loudly rather than silently hitting (or hanging on) a real network
call.

## Alternatives Considered

**Mocking `fetch` globally, or mocking the `api/` module in every test:**
considered adequate for hook-level unit tests (and still used there — see
`useTodos.test.tsx`), but insufficient for integration tests, since it
doesn't exercise the real request/response cycle or catch issues like
malformed URLs (see the `/undefined/todos` CI failure this caught in
practice, root-caused to a missing `.env.test`).

**Standing up a real, lightweight backend for tests (e.g. an in-memory
Express server):** rejected for the base app — heavier to maintain than
handler functions, and couples frontend test setup to backend framework
choices that may not even be decided yet.

## Consequences

**Easier:** integration tests exercise the real hook → cache → render
chain with only the network faked, catching a real class of bugs (as
happened in CI) that module-mocking would miss. Local development is
possible without a backend at all.

**Harder:** handlers must be kept roughly in sync with the real API's
eventual shape/behavior by hand — MSW doesn't validate against an OpenAPI
spec or similar in this setup, so a handler and the real backend can drift
without an automated check. Revisit if/when a backend contract (e.g.
OpenAPI) exists to generate handlers from.
