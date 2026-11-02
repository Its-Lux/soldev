# 0002. TanStack Query for Server State

Status: Accepted
Date: 2026-08-24

## Context

Server data (anything fetched from an API) has different needs than local
UI state: it can go stale, it can fail and need retrying, multiple
components may want the same data without triggering duplicate requests,
and mutations need to update cached copies elsewhere in the app. Managing
this by hand with `useState`/`useEffect`, or by copying server responses
into a general-purpose state manager, tends to reproduce a worse version of
what a dedicated library already solves.

## Decision

TanStack Query owns all server state, exclusively. Every read goes through
`useQuery`, every write through `useMutation`, both wrapped in
feature-local hooks under `hooks/` (never called directly from
`components/` or `pages/`). Query keys are centralized per feature in a
`queryKeys.ts` factory to avoid divergent/duplicate cache entries. Zustand
(see `store/` in each feature) is reserved exclusively for client/UI state
that has no server counterpart — filters, toggles, modal state.

## Alternatives Considered

**Storing server responses in Zustand (or Redux) alongside UI state:**
rejected — this creates two competing sources of truth for the same data
(the store's copy and whatever the server currently has), which drift out
of sync the moment a mutation happens elsewhere and the store isn't
manually kept in the loop.

**Plain `useEffect` + `useState` per component:** rejected — no
built-in caching, retries, request deduplication, or background
refetching; every component reinvents these concerns independently and
inconsistently.

## Consequences

**Easier:** loading/error/success states, caching, retries, and
invalidation are handled consistently everywhere via one small set of
conventions. Components stay simple — they receive data and callbacks, not
fetching logic.

**Harder:** requires discipline to keep server data out of Zustand even
when it would be "convenient" to have it there for a specific screen — this
is called out explicitly in `NEW_DEVELOPER_GUIDE.md`'s "Common Mistakes"
section because it's an easy line to blur under time pressure.
