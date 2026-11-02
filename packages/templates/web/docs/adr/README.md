# Architecture Decision Records

This folder records significant architectural decisions about this app: what
was decided, why, and what alternatives were considered. The goal is that six
months from now, nobody has to guess why something was done a certain way;
they can read the ADR.

**When to write one:** any decision that would be genuinely annoying or costly
to reverse, or that a new contributor would reasonably ask about. Not every
choice needs one.

<!-- template-only:start -->

Smaller calls are recorded in the decision log in `docs/BUILD_GUIDE.md`.
<!-- template-only:end -->

**Format:** run `yarn generate:adr`, which numbers the file and fills in the
sections from `template.md`. ADRs are never edited to reflect a reversed
decision: if a decision changes, write a new ADR that supersedes the old one
and note the supersession in both. The history of why a decision changed is as
valuable as the current state.

Decisions about the whole repository, such as the monorepo layout, live in the
root `docs/adr/` instead.

## Index

| #                                                                                     | Title                                                               | Status             |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------ |
| [0001](./0001-feature-sliced-architecture.md)                                         | Feature-sliced architecture                                         | Accepted           |
| [0002](./0002-tanstack-query-for-server-state.md)                                     | TanStack Query for server state                                     | Accepted           |
| [0003](./0003-msw-for-mocking-and-integration-tests.md)                               | MSW for mocking and integration tests                               | Accepted           |
| [0004](./0004-multi-stage-docker-build.md)                                            | Multi-stage Docker build (Node to nginx)                            | Accepted           |
| [0005](./0005-routing-with-tanstack-router-and-eslint-enforced-feature-boundaries.md) | Routing with TanStack Router and ESLint-enforced feature boundaries | Proposed           |
| [0006](./0006-api-default-handler.md)                                                 | API default handler                                                 | Proposed           |
| [0007](./0007-post-only-requests.md)                                                  | POST-only requests                                                  | Proposed           |
| [0008](./0008-generator-suite.md)                                                     | Generator suite                                                     | Proposed           |
| [0009](./0009-theme-and-charts.md)                                                    | Theme and charts                                                    | Proposed           |
| [0010](./0010-form-builder.md)                                                        | Form builder                                                        | Superseded by 0012 |
| [0011](./0011-routing-and-boundaries.md)                                              | Routing and boundaries                                              | Proposed           |
| [0012](./0012-remove-zod-in-favour-of-plain-typescript.md)                            | Remove Zod in favour of plain TypeScript                            | Accepted           |
