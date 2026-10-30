# 0006. API default handler

Status: Proposed
Date: 2026-10-05

## Context

This template is meant to be cloned for different projects. The first real
system it will serve has a specific approach to access: a session token carried
by the client, responses wrapped in a `status` envelope, users hold roles at three tiers (system, client and asset), and the frontend keeps
the user in a store. That is one project's current reality, and its
requirements may change.

Without a decision, one of two things happens. The template hard-codes that
approach, which makes it wrong for the next project. Or every project
reinvents the pattern with no guidance, and every feature's `api.ts` ends up
repeating its own response handling, as the `todos` reference feature did
before this change.

## Decision

The template does not implement authentication or access control. It
provides seams, which are places where a project plugs in its own behaviour,
with neutral defaults:

1. **The API client.** Features call `request()` from `shared/lib/api`
   instead of `fetch`. A single `configureApi` call, made in
   `src/app/api/setupApi.ts`, sets how requests are prepared (where a token
   goes), how responses are unwrapped, how errors are read, and what happens
   on a 401 or 403. The defaults are bare JSON and no credentials.
2. **`Layout.tsx`.** Nav items are filtered here, before they reach a navbar,
   so the navbar variants stay unaware of any access model.
3. **Router `beforeLoad`.** Route guards are defined in `app/router/`, since a
   feature may not import from `app/`.

The existing system's approach is kept as a worked example in
`docs/examples/existing-system-adapter.ts`, outside `src/`, so it informs
without binding. `roles` was removed from `NavItem`, and no replacement ships
in the template. The server remains the authority on access. Hiding a link in
the client is display only.

## Alternatives Considered

**Port the existing system's auth store as it is.** Rejected. It ties the
template to one contract, and it keeps server data (the user) in a Zustand
store, which conflicts with ADR 0002.

**Ship a full `auth` feature with a generic role model.** Rejected. A model
generic enough to suit every project is too thin to be useful, and a specific
one, such as three role tiers, encodes assumptions the next project may not
share.

**Document the pattern and change nothing in code.** Rejected. With no client
seam, every feature's `api.ts` hard-codes response handling, so adopting a
different backend contract later means editing every feature and every
generator template.

## Consequences

**Easier:** adopting a different backend contract is one adapter file. Each
feature's API methods shrink to one-line calls. The generators emit the same
shape as the reference feature, and a test confirmed the feature generator and
the hook generator produce equivalent code.

**Harder:** every project writes its own small adapter. Its mock handlers must
return whatever contract it uses, or the client will reject them, which
relates to the drift risk noted in ADR 0003. Session handling (where a token
lives, expiry, refresh) is left entirely to the project. The example adapter
sits outside `src/`, so `yarn typecheck` does not compile it and it can go
stale.

A rule that applies to any project: a credential and its expiry are client
state, but anything the server owns, such as the user's profile and
permissions, is server state and belongs in a TanStack Query hook, not copied
into a store.
