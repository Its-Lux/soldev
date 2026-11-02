# 0001. Monorepo layout

Status: Accepted
Date: 2026-11-02

## Context

The company runs soltrak-rewrite as a Yarn workspaces monorepo: several
frontends, an API and a shared data library in one repository, with Docker
files per deployable under `hosting/docker/`. A new frontend template
(soldev-ui) and a colleague's API and data templates were being built in
separate repositories, to be combined. Their layout and tooling had to agree
before they met, or every shared file would conflict on merge day.

## Decision

The repository mirrors soltrak-rewrite's shape:

- **`packages/templates/web`** holds the frontend template as a workspace that
  runs, lints and type-checks, but is never deployed.
- **`packages/web/<app>`** holds frontends, created with
  `yarn generate:web-app <name>`, which copies the template and strips
  template-only content (listed in `template.json` or marked with
  `template-only:start`/`end` comments). `packages/web/api` holds the API.
- **`packages/libs/<lib>`** holds shared libraries, such as the data layer.
- **Scopes follow the folder group:** `@templates/web`, `@web/<app>`,
  `@libs/<lib>`.
- **Yarn 4.7.0** with `nodeLinker: node-modules`, its binary vendored in
  `.yarn/releases`, one root lockfile.
- **Shared tooling at the root:** `tsconfig.base.json`,
  `eslint.config.base.js` (environment-neutral rules only), `.prettierrc`,
  `.gitattributes` (LF everywhere) and Husky with lint-staged. Each package
  extends the base config and keeps its own `lint-staged` block.
- **Docker per deployable** in `hosting/docker/<app>/`, always built with the
  repo root as context.
- **Generators stay per package** (each package's own `plopfile.js`); this
  folder holds repo-wide ADRs, and each package keeps its own series.

## Alternatives Considered

**Keep separate repositories.** No coordination needed, but shared types and
conventions would be copied between repos and drift.

**Keep the template as its own repository and copy it into the monorepo per
app.** Decouples template work, but splits the single-repo shape being
mimicked and makes template fixes harder to share.

**Yarn Classic.** Already in use by the template, but in maintenance only, and
soltrak-rewrite uses Yarn 4.

**Plug'n'Play instead of `node-modules`.** Faster and stricter, but ESLint's
TypeScript resolver, Plop and some Vite plugins need extra configuration.

**One root plopfile for every package.** A single entry point, but generator
names collide and two owners would share one file.

**Plop for creating apps.** Rejected: Plop renders every file through
Handlebars, which breaks JSX `{{ }}`.

## Consequences

**Easier:** one install, one lockfile and one set of tooling rules for every
package; new frontends in one command; Docker builds can see shared packages.

**Harder:** template fixes made after an app was generated must be copied into
that app by hand, until shared code moves into packages such as
`packages/libs/ui`. Root tooling changes affect every package, so they need
agreement between the frontend and backend owners. The `@web` scope also
exists on the public npm registry, so a misnamed workspace dependency could
resolve there instead of locally. The conventions shared with the API and data
packages (toolchain versions, the API contract) still need agreeing with the
colleague who owns them.
