# Architecture Decision Records

This folder records significant architectural decisions made on this
project: what was decided, why, and what alternatives were considered. The
goal is that six months from now, nobody has to guess "why did we do it this
way" — they can read the ADR.

**When to write one:** any decision that would be genuinely annoying or
costly to reverse, or that a new contributor would reasonably ask about.
Not every choice needs one — see `BUILD_GUIDE.md`'s decision log for smaller
calls.

**Format:** copy `template.md`, number it sequentially, fill it in. ADRs are
never edited to reflect a reversed decision — if a decision changes, write a
new ADR that supersedes the old one and note the supersession in both files.
The history of _why we changed our minds_ is as valuable as the current
state.

## Index

| #                                                       | Title                                   | Status   |
| ------------------------------------------------------- | --------------------------------------- | -------- |
| [0001](./0001-feature-sliced-architecture.md)           | Feature-sliced architecture             | Accepted |
| [0002](./0002-tanstack-query-for-server-state.md)       | TanStack Query for server state         | Accepted |
| [0003](./0003-msw-for-mocking-and-integration-tests.md) | MSW for mocking and integration tests   | Accepted |
| [0004](./0004-multi-stage-docker-build.md)              | Multi-stage Docker build (Node → nginx) | Accepted |
