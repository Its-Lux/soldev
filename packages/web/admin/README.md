# Soldev UI

A Vite, React and TypeScript frontend built on a feature-sliced architecture,
with the structure, tooling, validation approach and scaffolding already
decided and working.

## Tech stack

- **Build tool:** Vite
- **Framework:** React with TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`), token-based theming with light and dark mode
- **Server state:** TanStack Query
- **Routing:** TanStack Router
- **Client state:** Zustand (UI state only, never server data)
- **Validation:** plain TypeScript types; runtime checks are opt-in through the `parse` option of `request()`
- **Forms:** TanStack Form, used by a schema-driven form builder with hand-written validation
- **Charts:** ApexCharts
- **Maps:** Google Maps via `@vis.gl/react-google-maps` (`shared/ui/map`)
- **Icons:** react-icons
- **Motion:** Framer Motion, used sparingly (navigation and sidebar only)
- **Mocking:** MSW, development only
- **Scaffolding:** Plop.js
- **Package manager:** Yarn 4 workspaces (the version is vendored in the repo)
- **Containerisation:** Docker, multi-stage build served by nginx

TanStack Table and TanStack Virtual are installed but not yet used.

## Getting started

Prerequisites: Node `>=24.18.0`. Yarn comes with the repo.

This package is one workspace in a monorepo. Install from the repo root, then
work from this folder:

```bash
yarn install
cp .env.example .env
yarn dev
```

Mock data from MSW is enabled automatically in development, so no backend is
needed to work on the UI. The repo root also has aliases such as
`yarn run:<app>`, `yarn build:<app>` and `yarn lint:<app>`.

## Scripts

Run these from this folder:

| Command                   | Description                                           |
| ------------------------- | ----------------------------------------------------- |
| `yarn dev`                | Start the dev server with mocked API data             |
| `yarn build`              | Type-check and produce a production build in `dist/`  |
| `yarn lint`               | Run ESLint, including the feature boundary rules      |
| `yarn typecheck`          | Run `tsc --noEmit`                                    |
| `yarn format`             | Run Prettier                                          |
| `yarn generate:feature`   | Scaffold a full feature slice                         |
| `yarn generate:route`     | Add routing to an existing feature                    |
| `yarn generate:hook`      | Add one mutation hook to an existing feature          |
| `yarn generate:component` | Scaffold one component into a feature or `shared/ui`  |
| `yarn generate:adr`       | Create the next numbered Architecture Decision Record |

Docker commands live at the repo root: `yarn docker:<app>:build` and
`yarn docker:<app>:verify`.

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
      api/         HTTP calls through request(), with an optional runtime parse
      services/    Pure data transforms
      hooks/       useQuery and useMutation wrappers
      store/       Client and UI state only (Zustand)
      components/  Presentational components
      pages/       Route-level composition
      types/       Plain TypeScript domain types
      libs/        Feature-local helpers
      index.ts     The feature's public surface
  test/       Development mock worker (MSW)
```

Server data lives only in TanStack Query's cache. A lint rule stops one
feature importing another feature's internals.

TypeScript types are compile-time promises only. Data arriving at runtime is
checked only where a call passes `parse` to `request()`, for example
`request({ path, parse: parseFormSchema })` for a form description.

Further reading:

- `docs/NEW_DEVELOPER_GUIDE.md` for the mental model and where code goes
- `docs/adr/` for Architecture Decision Records

## Environment variables

| Variable                   | Description                                                                                  | Required |
| -------------------------- | -------------------------------------------------------------------------------------------- | -------- |
| `VITE_API_BASE_URL`        | Base URL for API requests                                                                    | Yes      |
| `VITE_ENABLE_MOCKS`        | `true` bakes the mock layer into a production build (a demo image). Development always mocks | No       |
| `VITE_GOOGLE_MAPS_API_KEY` | Browser key for the map components; restrict it by HTTP referrer in Google Cloud             | No       |
| `VITE_GOOGLE_MAPS_MAP_ID`  | Map ID for the map components                                                                | No       |

- `.env` holds local values and is never committed
- `.env.example` documents the variables and is committed
- `.env.test` is retained for when automated tests return
- Read variables through `env` (`@/shared/config`), not `import.meta.env`. The developer
  guide explains two traps

`VITE_*` variables are baked into the bundle at build time. A built artefact,
including a Docker image, is tied to the values set when it was built.

## Docker

The image is built from the repo root, with the Dockerfile in
`hosting/docker/<app>/`. A Node stage compiles the app and an nginx stage
serves only the static output. `.env` is not copied into the image, so pass
`VITE_*` values as build arguments. MSW and its worker file are excluded
unless the image is built with `VITE_ENABLE_MOCKS=true`.

## Current status and known limits

- There is no automated test suite or CI pipeline. Both were built and proven
  earlier, then removed. Re-adding them is deferred pending a lighter setup.
- There is no real backend yet. The app uses MSW in development and shows its
  error state when run without one.
- The `app` layer can import any file inside a feature, not only its
  `index.ts`. Cross-feature imports are blocked.

## Contributing

New to the project? Start with `docs/NEW_DEVELOPER_GUIDE.md`.
