# 0011. Routing and boundaries

Status: Proposed
Date: 2026-10-05

## Context

The architecture says a feature is self-contained and never imports another
feature's internals. Convention alone is not enforced, and routing creates a
tension: a route needs the router's root route, which belongs to `app/`, and a
feature may not import from `app/`.

## Decision

1. **Route definitions live in `app/router/routes/`**, one file per route,
   registered in `router.ts`. Each imports its page through the feature's
   `index.ts`. A route is never defined inside a feature.
2. **ESLint enforces the dependency rules** with `eslint-plugin-boundaries`
   (`boundaries/dependencies`). `app` may import `app`, `shared` and features.
   `shared` may import only `shared`. A feature may import `shared` and itself.
3. **Two settings make the rule work at all.** It needs
   `eslint-import-resolver-typescript`, because the plugin has no resolver of
   its own, and the `app` element needs a recursive glob (`src/app/**`),
   because the plugin only classifies files inside a matched folder, and
   `App.tsx` sits directly in `src/app/`.
4. **Pages may use the router library's own hooks**, such as `useParams` and
   `useNavigate`, since that imports from the library and not from `app/`.
   Components stay router-free and take callbacks.

## Alternatives Considered

**Convention and code review only.** Rejected. A rule nobody enforces erodes.

**Define routes inside features.** Rejected. Each feature would import the root
route from `app/`, which is the dependency the rule forbids.

## Consequences

**Easier:** a cross-feature import fails `yarn lint`. This was verified with a
deliberate import from one feature into another.

**Harder:** without the resolver, every import is classified as unknown and the
rule never fires, with no error. If a violation is not caught, check this
first. `app` can currently reach any file inside a feature, not only its
`index.ts`, because the plugin's entry-point enforcement is deprecated with no
confirmed replacement. Detail routes with parameters are written by hand, since
the route generator only creates list routes.
