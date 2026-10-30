# 0001. Feature-Sliced Architecture

Status: Accepted
Date: 2026-08-24

## Context

The project needed a folder structure that scales as more features are
added, without every feature accumulating hidden dependencies on shared
code that makes it hard to understand, test, or remove in isolation. The
starting constraint was explicit: everything a feature needs should live
inside that feature.

## Decision

Organize the codebase by feature (vertical slice), not by technical layer
(no project-wide `components/`, `hooks/`, `services/` at the top level).
Each feature under `src/features/<name>/` owns its own `api/`, `services/`,
`hooks/`, `store/`, `components/`, `pages/`, `types/`, and `libs/`. A
feature exposes only what it wants used elsewhere through a single
`index.ts` barrel; everything else is a private implementation detail.

`src/app/` holds app-wide shell concerns (providers, error boundary).
`src/shared/` holds only primitives that are genuinely identical across
multiple unrelated features (a design-system Button, a generic date
formatter) — kept deliberately small by design, not a dumping ground.

Dependency direction within a feature: `pages → components → hooks →
services/api/store`. Features never import another feature's internals
directly — only its public barrel.

## Alternatives Considered

**Layer-first structure** (`src/components/`, `src/hooks/`, `src/services/`
at the project root, organized by technical type rather than by feature):
rejected because as the app grows, understanding or removing one feature
requires touching files scattered across many top-level folders, and it's
easy for logic belonging to one feature to accidentally leak into a
generic-looking shared file.

**Domain-driven "modules" with shared kernel by default:** considered, but
tends to grow the shared layer unchecked over time unless actively
resisted — every feature adding "just one more" shared helper eventually
recreates the coupling this structure is meant to avoid.

## Consequences

**Easier:** a feature can be understood, tested, or deleted by looking at
one folder. Onboarding to a single feature doesn't require understanding
the whole app. The Plop generator (see `BUILD_GUIDE.md` Phase 6) can encode
this shape as a repeatable command.

**Harder:** genuine cross-feature reuse requires deliberate promotion to
`shared/` rather than an easy import — this is a cost accepted
intentionally, to keep `shared/` from becoming an uncontrolled dumping
ground. The "no reaching into another feature's internals" rule is now
enforced by an ESLint rule (`eslint-plugin-boundaries`, see the build
guide's decision log), verified against a real cross-feature import
attempt. One narrower gap remains open: `app/` can currently import any
file inside a feature, not strictly limited to that feature's `index.ts`
barrel — the plugin's dedicated "entry-point" enforcement is deprecated in
the installed version with no confirmed migration path found yet, so this
is tracked as a follow-up rather than solved outright.
