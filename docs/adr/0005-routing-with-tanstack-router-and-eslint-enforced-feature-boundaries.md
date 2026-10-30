# 0001. Routing with TanStack Router and ESLint-Enforced Feature Boundaries

Status: Proposed
Date: 2026-09-11

## Context

The app had no routing (Phase 3 of the base build produced a single-page
shell). With more than one feature now existing (`todos`, `orders`,
`notifications`), a real navigation structure was needed. Separately, the
feature-sliced architecture (ADR 0001) had always relied on convention —
"features don't import each other's internals" — with no automated
enforcement, flagged at the time as a reasonable but unfinished gap.

## Decision

**Routing:** TanStack Router, with all route definitions centralized in
`src/app/router/` — never inside a feature. A single root route renders a
shared `Layout` (nav + `Outlet`); each feature gets one route, importing
that feature's page component through its public barrel (`@/features/x`),
never a deeper internal path.

**Boundary enforcement:** `eslint-plugin-boundaries`, configured with three
element types (`app`, `shared`, `feature`, the last capturing its own
feature name) and a `boundaries/dependencies` policy: `app` may import
`app`/`shared`/`feature`; `shared` may only import `shared`; a `feature`
may import `shared` or _itself_ (same captured `featureName`), but not
another feature. This makes cross-feature imports a real lint failure, not
just a reviewed-by-hand convention.

These two decisions are linked: routing needed to live in `app/`
specifically _because_ the boundary rule disallows `feature → app`, so a
route file that needed to reference the root route could not live inside a
feature without violating the rule this same session established.

## Alternatives Considered

**Routes defined inside each feature, aggregated by `app/`:** rejected —
would require either `feature → app` imports (disallowed by the boundary
rule) or a more complex re-export chain for no real benefit, since routing
is inherently an app-shell concern, not a feature concern.

**Leaving boundary enforcement as convention-only (the original ADR 0001
state):** rejected once a second and third feature existed — convention
alone doesn't scale past a couple of features and a single reviewer; a real
lint rule catches violations before code review, not during it.

## Consequences

**Easier:** a cross-feature import is now a `yarn lint` failure with a
specific message, not something a reviewer has to notice by eye. New
features get routing "for free" via the `feature` and `route` Plop
generators (see the generator suite, tracked separately), rather than
requiring a manual wiring step that's easy to forget.

**Harder / known gaps:** `eslint-plugin-boundaries` resolves module paths
via the same `import/resolver` convention as `eslint-plugin-import`, which
is not obvious and cost real debugging time to discover — the plugin
silently treats every import as unresolved without an explicit
`eslint-import-resolver-typescript` resolver configured, producing no
error, just a rule that never fires. Element patterns also only classify
files that sit _inside_ a matched folder — a bare file directly in
`src/app/` (e.g. the original `App.tsx`) doesn't match a `src/app/*`
pattern and needs a recursive `src/app/**` glob instead. Both are now
correctly configured, but are easy to silently regress if the config is
ever rewritten without this context. Separately, `app → feature` is
currently permitted to reach _any_ file inside a feature, not restricted to
its `index.ts` barrel specifically — the plugin's dedicated entry-point
enforcement is deprecated in the installed version with no confirmed
migration syntax found; tracked in `NEXT_STEPS_CHECKLIST.md`.
