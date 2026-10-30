# 0008. Body generator suite

Status: Proposed
Date: 2026-10-05

## Context

The architecture only holds if every feature has the same shape: types, an
API file, mock handlers, hooks, a list component, a page, a barrel, a route
and usually a nav link. Copying a feature by hand drifts, and a feature that
is generated but left unrouted, or routed without its mock handlers, fails in
confusing ways.

## Decision

The project has a Plop generator suite. Each generator is small. The value is
in the shape it encodes.

1. **`feature`** scaffolds a full slice: types, API, mock handlers, query
   keys, a list hook, a list component, a page, a barrel, a route and an
   optional nav link. It also offers an optional Zustand store (default no)
   and optional create, update and delete mutations. Each ticked mutation
   gets a hook, an API method and a mock handler. The nav link can be
   top-level, added to an existing dropdown group, the start of a new group,
   or omitted for pages reached from inside a feature.
2. **`route`** wires routing onto a feature that exists but is not routed. Its
   prompt validates that the feature exists and is not already routed, so a
   repeated run cannot insert duplicate entries.
3. **`hook`** adds one mutation hook to an existing feature, and patches both
   the feature's `api.ts` and its mock handlers file. It refuses to run, and
   changes nothing, if either file lacks its anchor.
4. **`adr`** creates the next numbered Architecture Decision Record, using the
   highest existing number plus one rather than a file count.
5. **`component`** scaffolds one component into a feature or into `shared/ui`.

Generated files are wired together through anchor comments that must match
exactly: `// plop:route-import` and `// plop:route-child` in `router.ts`;
`// plop:nav-icon-import`, `// plop:nav-link` and one
`// plop:nav-group:<slug>` per group in `Layout.tsx`; `// plop:mutation` in an
API file and `// plop:handler` in a mock handlers file. The generated shape
follows the reference feature, including the POST-only convention.

## Alternatives Considered

**Copy the reference feature by hand.** Rejected. It drifts, and it relies on
each person remembering every step, including routing and mocks.

**One generator with many flags.** Rejected. It is harder to extend and to
check, and several needs, such as adding a single hook later, do not fit a
create-everything run.

**Generate from an API specification.** Not possible yet, because there is no
specification. It is worth revisiting once a real backend contract exists.

## Consequences

**Easier:** every feature starts with the same shape. A test confirmed that a
feature generated with all mutations and a feature patched by three runs of the
hook generator produce equivalent code. A second test confirmed a generated API
reaches its generated mock handlers, with an unhandled request failing the
test.

**Harder:** anchors are literal matches, and Plop's `append` and `modify` do
nothing, while reporting success, when an anchor is missing. The hook generator
checks for this, but `feature` and `route` do not yet. A pattern that assumed
LF line endings silently failed on CRLF files on Windows, so patterns must
tolerate both. Generators write files once, so changing a template does not
fix files already generated. Paired templates, such as the API and its
handlers, must agree on route and verb, so they are worth testing together.
