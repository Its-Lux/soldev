# soldev

Monorepo for SOLINK's web platform: frontends, the API and shared libraries
in one repository, with one install, one lockfile and one set of tooling
rules. Its shape mirrors soltrak-rewrite.

## Repository layout

```
soldev/
├── docs/adr/                 Repo-wide architecture decisions
├── hosting/docker/           One folder per deployable, plus _web-template
├── scripts/                  Repo tooling (generate and remove frontends)
└── packages/
    ├── templates/web/        Frontend template (@templates/web), never deployed
    ├── web/
    │   ├── client/           Customer frontend (@web/client)
    │   └── api/              API (@web/api), coming
    └── libs/
        ├── data/             Data layer (@libs/data), coming
        └── types/            Shared API contract types (@libs/types), planned
```

| Area                     | Owner    | Notes                                                  |
| ------------------------ | -------- | ------------------------------------------------------ |
| `packages/templates/web` | Frontend | Source for every frontend; improve it here first       |
| `packages/web/<app>`     | Frontend | Generated from the template, then developed as an app  |
| `packages/web/api`       | Backend  | Hono API                                               |
| `packages/libs/data`     | Backend  | TypeORM entities, queries and logic, with its own Plop |
| `packages/libs/types`    | Shared   | Types only; the contract between frontends and the API |
| Root tooling and `docs/` | Shared   | Changes affect every package, so agree them first      |

## Prerequisites

- **Node `>=24.18.0`**
- **Git Bash** on Windows (or any POSIX shell). Commands in this repo assume it.
- **Yarn** is vendored in `.yarn/releases` (4.7.0). Any installed `yarn`
  command hands over to it, so no global setup is needed beyond having one.
  If you enable Corepack and use PowerShell, you may need
  `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` for its `yarn` shim.
- **Docker Desktop**, only to build or verify images.

## Getting started

```bash
git clone <repo-url> soldev
cd soldev
yarn install
yarn run:client
```

`yarn install` also installs the git hooks. In development the frontends run
on mock data (MSW), so no backend and no `.env` file are needed: with a blank
`VITE_API_BASE_URL`, requests and mock handlers share the page's own address.
To set real values, copy a package's `.env.example` to `.env`; it is never
committed.

## Common commands

Run from the repo root.

| Command                        | What it does                                        |
| ------------------------------ | --------------------------------------------------- |
| `yarn run:<app>`               | Start an app's dev server (`client`, `template`)    |
| `yarn build:<app>`             | Type-check and build an app                         |
| `yarn lint:<app>`              | Lint an app, including the feature boundary rules   |
| `yarn typecheck:<app>`         | Type-check an app                                   |
| `yarn docker:<app>:build`      | Build an app's production image                     |
| `yarn docker:<app>:verify`     | Build, run and check an app's image                 |
| `yarn generate:web-app <name>` | Create a new frontend from the template             |
| `yarn remove:web-app <name>`   | Remove a generated frontend (asks for confirmation) |
| `yarn typecheck:scripts`       | Type-check the repo tooling in `scripts/`           |

Any package script can also be run with `yarn workspace <package> <script>`,
for example `yarn workspace @web/client generate:feature`.

## Frontends

New frontends are generated, never copied by hand:

```bash
yarn generate:web-app admin --port 5175
yarn install
```

This copies `packages/templates/web` to `packages/web/admin` (`@web/admin`),
strips template-only content (the in-app guide, the template's build history
and examples), creates `hosting/docker/admin/` and adds `run:admin`,
`build:admin` and the other root scripts. If any code still refers to
something it stripped, it stops and rolls everything back.

To remove one:

```bash
yarn remove:web-app admin
yarn install
```

It refuses to delete anything that is not a generated app, that another
workspace depends on, or that has uncommitted changes (unless `--force`), and
asks you to type the name to confirm.

**Template fixes are not inherited.** A generated app is a copy. A fix made to
the template afterwards must be applied to existing apps by hand, so make
architectural changes in the template first, then carry them across.

Each frontend's own guide is in `packages/web/<app>/docs/NEW_DEVELOPER_GUIDE.md`.

## Shared tooling

| File                    | Purpose                                                          |
| ----------------------- | ---------------------------------------------------------------- |
| `tsconfig.base.json`    | Strict TypeScript settings every package extends                 |
| `eslint.config.base.js` | Environment-neutral lint rules every package extends             |
| `eslint.config.js`      | Lints root files and packages without their own config           |
| `.prettierrc`           | One format for every package                                     |
| `.gitattributes`        | LF line endings everywhere, whatever each machine's Git settings |
| `.husky/pre-commit`     | Runs lint-staged on every commit                                 |
| `tsconfig.json`         | Type-checks `scripts/` only                                      |

On commit, staged files are linted and formatted using the configuration
closest to each file, so every package keeps its own rules. A commit that
breaks a rule, such as one feature importing another's internals, is blocked.
Change shared settings only with agreement from both frontend and backend.

## Docker

Every image is built with the repo root as context, so it can see the
lockfile, the vendored Yarn and shared packages. Each deployable has its
Dockerfile in `hosting/docker/<app>/`:

```bash
yarn docker:client:build
yarn docker:client:verify
```

`VITE_*` values are baked in at build time and passed as build arguments
(`.env` is never copied into an image). The verify script checks that the
image serves the app, has no Node or mock layer in it, and received the API
address. See the frontend developer guide for production and demo builds.

## Conventions

- **Package scopes follow the folder:** `@templates/*`, `@web/*`, `@libs/*`.
- **API calls are POSTs to `/<prefix>/<action>`** (for example
  `/todos/getAll`) with flat JSON bodies, `{}` when there are no parameters.
- **Shared contract types live in `@libs/types`** (planned): types only,
  JSON-safe, never database entities.
- **No Zod.** Types are plain TypeScript; runtime checks are opt-in per call
  (see ADR 0012 in the template).
- **British English** in documentation and user-facing text.

## Documentation

| Where                                                 | What                                            |
| ----------------------------------------------------- | ----------------------------------------------- |
| `docs/adr/`                                           | Repo-wide decisions, starting with the layout   |
| `packages/templates/web/docs/adr/`                    | Frontend decisions (also copied into each app)  |
| `packages/templates/web/docs/BUILD_GUIDE.md`          | How the template was built, with a decision log |
| `packages/templates/web/docs/NEXT_STEPS_CHECKLIST.md` | What is open                                    |
| `packages/web/<app>/docs/NEW_DEVELOPER_GUIDE.md`      | Working on a frontend                           |

## Current status

- The frontends run on mock data; the API and data packages are not in this
  repository yet.
- There is no automated test suite or CI pipeline. Verify changes with the
  `typecheck`, `lint` and `build` commands; the commit hook enforces lint and
  formatting.
- Changes reach `main` through pull requests.
