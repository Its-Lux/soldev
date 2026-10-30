# 0007. POST only requests

Status: Proposed
Date: 2026-10-05

## Context

Every API this organisation builds uses POST, for reads as well as writes.
Routes are named for the action rather than for a resource and a verb, for
example `/analyticsDashboard/getIrradiance` and `/user/acceptTos`. Bodies are
flat JSON, with ids named for the resource (`assetId`, `inverterId`).

The template's reference feature, mock handlers and generator templates were
first written in a REST style: `GET /todos`, `PATCH .../toggle` and
`DELETE /todos/:id`. A test showed that REST-verb mock handlers stop matching
once calls are sent as POST, so the mocks, the reference feature and the
generators could not coexist with a POST-only backend.

## Decision

The template adopts POST-only as its convention:

1. `request()` sends a POST by default, with an empty JSON body when a call
   has no parameters. Other methods remain available for a project that needs
   them.
2. Routes are `/<feature>/<action>`, with the action in camelCase, such as
   `/todos/getAll`, `/todos/getById`, `/todos/create`, `/todos/update`,
   `/todos/toggle` and `/todos/delete`.
3. Each feature's `api.ts` builds its routes through one `route()` helper, so
   the prefix and naming live in one place per feature.
4. Mock handlers use `http.post` for every route and read ids from the body.
5. `api.hbs`, `handlers.hbs` and the hook generator's template emit the same
   shape.

The action names are a starting point. The existing system uses names such as
`getIrradiance`, so a project with different names changes the strings in its
`api.ts` files. Ids are named `id` by default, because a generator cannot
derive a resource-specific key such as `assetId`.

## Alternatives Considered

**Keep REST in the template and adapt in each project.** Rejected. An adapter
can force the method to POST, but it cannot rename a REST path into an action
route, and the mock handlers would still not match. Every project would
rewrite the API layer and the mocks.

**Make the verb and route style configurable per feature.** Rejected for now.
It adds machinery for a case nobody has, since every API this organisation
builds is POST.

## Consequences

**Easier:** the reference feature, the mocks and the generators match the real
backends. A test runs the real `todosApi` against the real mock handlers, and
an unhandled request fails it, so a route or verb mismatch cannot pass quietly.

**Harder:** the verb no longer says whether a call reads or writes. An
idempotent read is a query and anything that acts is a mutation. A POST that
triggers work, such as an import, must never be a query, because queries
refetch on window focus and reconnect. Reads sent as POST cannot be cached by
the browser or a CDN. A project whose backend is REST would have to undo this
convention, which is the cost of choosing one.
