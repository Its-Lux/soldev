# Soldev UI

A reusable Vite, React and TypeScript starting point built on a feature-sliced
architecture. Clone it to start a new frontend project with the structure,
tooling, validation and scaffolding already decided and working.

## Tech stack

- **Build tool:** Vite
- **Framework:** React with TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`), token-based theming with light and dark mode
- **Server state:** TanStack Query
- **Routing:** TanStack Router
- **Client state:** Zustand (UI state only, never server data)
- **Validation:** Zod, at every API boundary
- **Forms:** TanStack Form, used by a schema-driven form builder
- **Charts:** ApexCharts
- **Icons:** react-icons
- **Motion:** Framer Motion, used sparingly (navigation and sidebar only)
- **Mocking:** MSW, development only
- **Scaffolding:** Plop.js
- **Package manager:** Yarn (Classic, 1.x)
- **Containerisation:** Docker, multi-stage build served by nginx

TanStack Table and TanStack Virtual are installed but not yet used.

## Getting started

Prerequisites: Node `>=24.18.0` (see `.nvmrc`) and Yarn 1.x.

```bash
yarn install
cp .env.example .env
yarn dev
```

Mock data from MSW is enabled automatically in development, so no backend is
needed to work on the UI.

## Scripts

| Command                    | Description                                           |
| -------------------------- | ----------------------------------------------------- |
| `yarn dev`                 | Start the dev server with mocked API data             |
| `yarn build`               | Type-check and produce a production build in `dist/`  |
| `yarn lint`                | Run ESLint, including the feature boundary rules      |
| `yarn typecheck`           | Run `tsc --noEmit`                                    |
| `yarn format`              | Run Prettier                                          |
| `yarn generate:feature`    | Scaffold a full feature slice                         |
| `yarn generate:route`      | Add routing to an existing feature                    |
| `yarn generate:hook`       | Add one mutation hook to an existing feature          |
| `yarn generate:component`  | Scaffold one component into a feature or `shared/ui`  |
| `yarn generate:adr`        | Create the next numbered Architecture Decision Record |
| `yarn docker:build`        | Build the Docker image                                |
| `yarn docker:run`          | Run the image on port 8080                            |
| `yarn docker:run:detached` | Run the image in the background                       |
| `yarn docker:stop`         | Stop the background container                         |
| `yarn docker:clean`        | Remove the container and image                        |

## Architecture

Each feature under `src/features/` is self-contained. Data flows in one
direction inside a feature:

```
pages -> components -> hooks -> services / api / store
```

```
src/
  app/        Providers, router, root layout
  shared/     Cross-feature code only (ui, lib, config, form-builder)
  features/
    <feature>/
      api/         Raw HTTP calls, validated with Zod
      services/    Pure data transforms
      hooks/       useQuery and useMutation wrappers
      store/       Client and UI state only (Zustand)
      components/  Presentational components
      pages/       Route-level composition
      types/       Domain types, derived from Zod schemas
      libs/        Feature-local helpers
      index.ts     The feature's public surface
  test/       Development mock worker (MSW)
```

Server data lives only in TanStack Query's cache. A lint rule stops one
feature importing another feature's internals.

Further reading:

- `docs/NEW_DEVELOPER_GUIDE.md` for the mental model and where code goes
- `docs/BUILD_GUIDE.md` for the build history and decision log
- `docs/adr/` for Architecture Decision Records
- `docs/NEXT_STEPS_CHECKLIST.md` for what is open

## Environment variables

| Variable            | Description                                                                                  | Required |
| ------------------- | -------------------------------------------------------------------------------------------- | -------- |
| `VITE_API_BASE_URL` | Base URL for API requests                                                                    | Yes      |
| `VITE_ENABLE_MOCKS` | `true` bakes the mock layer into a production build (a demo image). Development always mocks | No       |

- `.env` holds local values and is never committed
- `.env.example` documents the required variables and is committed
- `.env.test` is retained for when automated tests return
- Read variables through `env` (`@/shared/config`), not `import.meta.env`. The developer
  guide explains two traps

`VITE_*` variables are baked into the bundle at build time. A built artefact,
including a Docker image, is tied to the values set when it was built.

## Docker

```bash
yarn docker:build
yarn docker:run
```

A Node stage compiles the app and an nginx stage serves only the static
output. MSW is excluded from production builds unless they are built with
`VITE_ENABLE_MOCKS=true`. `.env` is not copied into the image, so pass
`VITE_API_BASE_URL` as a build argument. See the developer guide.

## Current status and known limits

- There is no automated test suite or CI pipeline. Both were built and proven
  earlier, then removed. Re-adding them is deferred pending a lighter setup.
- There is no real backend yet. The app uses MSW in development and shows its
  error state when run without one.
- The `app` layer can import any file inside a feature, not only its
  `index.ts`. Cross-feature imports are blocked.

## Contributing

New to the project? Start with `docs/NEW_DEVELOPER_GUIDE.md`.
