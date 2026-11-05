# Next Steps Checklist

Everything below is genuinely open — not covered by the base app build. Use
this to pick up where this conversation left off, in a new chat or project.
Reference `docs/BUILD_GUIDE.md` and `docs/adr/` for the reasoning behind
anything here that needs more context.

## Monorepo restructure (done, 2026-11-02)

The template now lives in `packages/templates/web` inside a Yarn 4 monorepo
shaped like soltrak-rewrite. Done and verified:

- [x] Moved into `packages/templates/web` with history preserved
- [x] Root workspace on Yarn 4.7.0 (vendored binary, `nodeLinker: node-modules`);
      scopes `@templates/web`, `@web/<app>`, `@libs/<lib>`
- [x] LF line endings enforced by a root `.gitattributes`
- [x] Root `tsconfig.base.json`, `eslint.config.base.js` and `.prettierrc`;
      the template's ESLint config gives the same result from any folder
- [x] Husky and lint-staged at the root; each package keeps its own
      `lint-staged` block (closest config wins)
- [x] Docker built from the repo root: one Dockerfile in
      `hosting/docker/_web-template` with `__APP__` tokens, `yarn workspaces
focus`, mock worker removed when mocks are off. 10 of 10 verify checks
      for both template and client, 20 MB images
- [x] `sites` removed; `guide` and the template docs marked template-only
      (`template.json` plus `template-only:start`/`end` markers)
- [x] `yarn generate:web-app <name>` at the root: copies the template, strips
      template-only content, fails and rolls back if code still refers to a
      stripped path, sets up Docker and root scripts
- [x] `packages/web/client` generated from the template and verified
- [x] Plopfile `fs` paths anchored with `plop.getPlopfilePath()`
- [x] Zod removed and recorded (ADR 0012)

Opened by the restructure:

- [ ] Merge `chore/move-to-templates` into `main` through a pull request
- [x] Decision log rows in `BUILD_GUIDE.md` for the restructure, and a
      repo-wide ADR for the monorepo layout in the root `docs/adr/`
- [x] `setupApi()` was never called. Now called once at startup in `main.tsx`
      (template and client), verified with a temporary `prepareRequest` probe
- [x] The `todos` mock handlers used a hardcoded `http://localhost:3000/api`,
      so with no `.env` (a fresh clone) every request went unhandled. They now
      build on `env.API_ADDRESS`, like `handlers.hbs`
- [x] Template-specific lines in `NEW_DEVELOPER_GUIDE.md` and the ADR index
      wrapped in template-only markers; the client's copies regenerated
- [ ] The `component` generator writes `shared/ui/<Name>.tsx` as a flat file,
      while the convention is a folder per primitive with an `index.ts`
- [ ] The "Soldev UI" brand is hardcoded in `Layout.tsx` (navbar and footer),
      so every generated app shows it
- [ ] Fixes made to the template after an app was generated must be copied
      into that app by hand (the plopfile was the first case). Consider
      shared packages before a second frontend exists: `packages/libs/ui`
      (Tailwind v4 needs an `@source` line for it) and shared generators
- [x] `@libs/types`: shared, types-only request and response contracts, used by
      the template's `todos` feature and included in Docker images
- [x] Generators are contract-first: `generate:feature` creates the feature's
      contract in `@libs/types`, and `generate:hook` extends it
- [ ] Agree with the API owners how generated contracts are reviewed, and
      whether the API side generates contracts too or only consumes them
- [ ] Conventions to agree with the colleague who owns `libs/data` and
      `web/api`: toolchain versions, scopes, Prettier and ESLint, the API
      contract, line endings
- [ ] `yarn explain peer-requirements` (Yarn reports YN0086 on install)

## Current roadmap: making the template foolproof

This section is the live plan and takes precedence over older sections below
where they overlap. Work through it in order, confirming each step.

**Deferred by management, not by choice**

- [ ] Automated tests and CI. Declined for now. Before this can return, a
      lighter setup needs designing. Seed idea: Vitest only, covering pure
      logic (services, libs, the form builder's validation functions
      `validateFormSchema` and `validateField`), with no jsdom, no React
      Testing Library and no MSW node server, run locally with `yarn test`
      and no pipeline.

**Cleanup (do first, cheap and visible)**

- [x] Remove the throwaway features (`orders`, `notifications`, `notes`),
      their route files, nav entries and any handler registrations
- [x] Bring `README.md` and `NEW_DEVELOPER_GUIDE.md` in line with reality
      (both still describe tests and CI as present)
- [ ] ADRs. 0001 to 0012 exist and the index lists all of them; 0005's
      heading number and 0008's name are fixed. Still to do: decide whether
      the six ADRs marked Proposed (0005 to 0009 and 0011) should be
      Accepted, and whether 0011 duplicates 0005
- [x] Re-verify the Docker build with everything added since it last ran.
      Done in the monorepo restructure: `verify-docker.sh` passes 10 of 10 for
      the template and the client, and `.gitattributes` keeps `*.sh` as LF
- [x] The Docker image runs the mock layer. Fixed: `main.tsx` mocks only in
      development or when built with `VITE_ENABLE_MOCKS=true`, the
      `Dockerfile` takes `VITE_*` values as build arguments, and the verify
      script confirms MSW and `mockServiceWorker.js` are absent from the
      production image
- [ ] Remaining from the mock-layer fix: add `readonly VITE_ENABLE_MOCKS?:
string` to `vite-env.d.ts` if missing, document the flag in
      `.env.example`, and optionally add demo build scripts
- [ ] `env` module: replace `shared/config/env.ts` (the owner's existing one)
      and `shared/lib/api/config.ts`, so the API client's default address
      comes from `env`. Check `shared/config/index.ts` exports `env`. The
      mock gate in `main.tsx` and any `import.meta.env.DEV` guard that
      removes code from production must stay written out inline. Awaiting
      placement
- [x] Remove `roles` from `NavItem`, the plopfile prompt, the `quotedList`
      helper (if nothing else uses it) and the nav templates. Run
      `grep -rn "roles\|quotedList" src plop-templates plopfile.js` first,
      because TypeScript will not flag leftovers
- [x] ADR: authentication and access control are project-specific. The
      template provides seams, not an implementation. Added to the repo
- [x] Shared API client in `shared/lib` with one configuration point
      (`configureApi`) for request preparation, response unwrapping, error
      extraction and 401 and 403 handling. Neutral defaults: bare JSON, no
      auth. Working: `todos` runs on it, and `setupApi()` is called once at
      startup in `main.tsx`
- [ ] Example adapter for the existing system (token appended to the body,
      the real response shapes, session expiry) in `docs/examples/`, outside
      `src/`. Updated now that `withToken` is known. Awaiting the updated file
      being copied in
- [x] Developer guide section: adding authentication to a project (where the
      session lives, wiring `configureApi`, filtering nav items in
      `Layout.tsx`, a `beforeLoad` route guard). In the repo: the owner's
      uploaded guide contains it
- [ ] Optional: a mock response helper so a project changes its response
      contract in one place instead of in every handler

**Gaps against the original brief**

- [x] One real compound component: `Tabs`, verified in the browser
- [x] Theme toggle in the navbar variants (`actions` slot plus a shared
      `ThemeToggle`). Verified in the browser
- [x] Responsive navbar: `ResponsiveNavbar` (island from the md breakpoint
      up, drawer or bottom bar below it). Verified. Known limit: touch devices
      at md and wider still get hover-opened group menus
- [x] Footer on mobile: `Footer` gains `hideOnMobile`, the page content
      reserves space for the fixed bottom bar, and `ResponsiveNavbar` gains
      a `mobileVariant` prop (`drawer` or `bottom`). Verified
- [x] List then detail API pattern: `TodoDetail` type, `getById`, detail
      handler, `useTodo`, `TodoDetailPage` and the `/todos/$id` route.
      Working in the browser, confirmed by the owner after applying
      `todos-current-state.zip`. For the record: the POST-only `todosApi.ts`
      depends on this item's types, and the two deliveries overlap on
      `todosApi.ts` and its handlers, so applying them separately breaks
      the app
- [ ] Missing base components: `Modal` (native dialog), `DropdownMenu`
      (compound, ARIA menu button) and `Radio` with `RadioGroup`. Delivered,
      awaiting a check in the browser
- [ ] A `radio` field type for the form builder, using `RadioGroup`. No
      longer blocked: the builder is plain TypeScript now (ADR 0012), so this
      is a new entry in `FIELD_TYPES`, a branch in `validateField` and a
      registry entry

**Generator follow-ups**

- [x] Make the hook generator tolerate CRLF. Its anchor patterns accept
      `\r?\n`, and line endings across the repo are now LF, enforced by
      `.gitattributes`
- [ ] Review the five nav templates and generate a test group to confirm
      the `existingGroup` path re-emits its anchor
- [ ] Refresh the packaged skill. Rebuilt and validated as
      `vite-react-feature-sliced-builder.skill`: corrected the working-style rule
      about who creates files, rewrote the generator reference, and added
      references for the API client and for verifying deliveries. Awaiting
      installation. It also needs updating for the monorepo layout and the
      Zod removal
- [ ] Consider a generator for detail routes (`/name/$id`), which are
      still written by hand
- [x] Rework to POST-only: `request()` default, the `todos` API, the mock
      handlers, `api.hbs`, `handlers.hbs`, the hook generator block, the guide
      and the example adapter. Confirmed working
- [x] ADR for the POST-only convention. Added to the repo
- [ ] Mock handlers for generated mutations: `handlers.hbs` now emits create,
      update and delete handlers for the ticked mutations, and the hook
      generator patches the handlers file as well as `api.ts`, refusing to
      run if an anchor is missing. `handlers.hbs` is in the repo (confirmed by
      paste). Still to confirm: a full test run of the feature and hook
      generators on a throwaway feature
- [ ] When porting the existing analytics API files, move their
      `transform...` functions into `services/` as pure functions

**Safety nets that need no CI**

- [ ] gitleaks as a pre-commit hook
- [ ] `yarn audit` script
- [ ] Security headers in `nginx.conf`
- [ ] 404 page and route-level error boundary
- [ ] `eslint-plugin-jsx-a11y`
- [ ] commitlint

**Reference: the existing system's backend**
Taken from a route snippet, `authStore.ts` and the type files in the owner's
other project. This is an example, not a template requirement, and it may
change. It is kept to inform the example adapter.

- Routes run a middleware chain: `authBody` (is the session authenticated)
  then `authorizeUsers` (may this user use this endpoint)
- Responses carry a `status` object (`success`, `message`, and sometimes
  `code`). The analytics routes put the payload under a key named for the
  route (`IrradianceData`, `Inverters`, `TempValues`), `/dataimporter` uses
  `data`, and login returns `token` and `user` beside `status`
- Routes are `POST /<prefix>/<action>` with camelCase, verb-led actions, for
  example `/analyticsDashboard/getIrradiance` and `/user/acceptTos`. Bodies
  are flat JSON with ids named for the resource (`assetId`, `inverterId`).
  Dates are ISO strings with an offset, and `timePeriod` is a string such as
  DAY
- `getScatterPlot` is commented out on the backend but still has a frontend
  API file and a Bruno request, a live example of the contract drifting
- Auth is token based, not cookie based. The token is held client side and
  persisted to localStorage with its expiry. It travels in the JSON body: the
  frontend's `withToken` helper appends a token variable to every request
  body (confirmed by the owner). The Bruno requests show no token in the body
  and use inherited auth, set at collection level and not seen
- Token lasts 2 hours, with a warning 5 minutes before expiry and a refresh
  endpoint
- The other project's auth store also holds `user`, calls the API directly
  and redirects with `window.location.href`. That differs from this
  template's rule that server data lives in TanStack Query
- Access model: three role tiers held in one roles table and told apart by
  type. The same name appears in more than one tier, so a role must always
  be handled as type plus name, never name alone. System tier (on
  `user.systemRole`): SUPERENGINEER (product-owner developers, access to
  everything), ENGINEER (product-owner engineers, admin platform access but
  not everything), SUPERADMIN (customer side, creates clients and assigns
  roles to users on clients they created), ADMIN (customer side, assigned
  for client management), STANDARD (any user added to the system, can be
  elevated). Client tier (on `user.clients[].role`): ADMIN, STANDARD, VIEW,
  PERPROJECT. Asset tier: ADMIN, STANDARD, VIEW, with asset access shown as
  `permissionType` on `client.assets[]` (values unconfirmed). The
  `description` column is a placeholder ('General') and carries no meaning
- A client is the company a user is assigned to, so one user can hold
  different client roles at different clients. The other project keeps the
  active client in a `clientStore`, preselected from a `clientId` URL
  parameter. The server derives the client from the `assetId` on each
  request, so the browser never sends a client id: the active client is UI
  scoping only, and access is decided per resource on the server
- `User` carries `systemRole`, `clients: UserClient[]` (each holding the
  client, its assets and the user's role there) and `assets: any[]`. Roles
  reach the client as names, not as permissions
- The envelope type is `{ status: { success, message? }, token?, user?,
data? }`. Login returns `token` and `user` beside `status`, so a login
  response needs its own handling in the adapter
- Still unknown: the 401, 403 and general error response shapes, the values
  of `permissionType`, what `user.assets` holds, and what PERPROJECT means
  (read as: no blanket client access, access comes from asset roles)

**Open decisions**

- DECIDED AND DONE: Zod is removed from the system (ADR 0012, 2026-11-02).
  Domain types are plain interfaces; runtime checks are opt-in through the
  `parse` option of `request()`, which any function returning `T` or
  throwing can fill, including a library's parse method if a project ever
  wants one. The form builder validates by hand (`validateFormSchema`,
  `parseFormSchema`, `validateField`), with `FIELD_TYPES` driving both the
  `FieldType` union and the runtime check. Zod remains in the lockfile only
  as a dependency of `eslint-plugin-react-hooks`
- DECIDED AND DONE: POST-only is adopted and implemented (see the roadmap).
  The question was whether the template adopts POST-only as its convention.
  The owner says all
  the APIs they build use POST, including reads. If that is an organisation
  wide standard, the reference feature, mock handlers and generator templates
  should follow it. If it belongs to one backend, it belongs in an adapter
  Verified: the REST-verb mock handlers (`http.get`, `http.patch`,
  `http.delete`) stop matching once an adapter forces every call to POST, so
  the mocks, the reference feature and the generator templates (all still
  REST-shaped) cannot coexist with a POST-only backend
- With POST-only, the verb no longer says read or write. Classify by effect:
  an idempotent read is a query, anything that acts is a mutation. A POST
  that triggers work, such as an import, must never be a query, because
  queries refetch on window focus and reconnect

**Planned feature**

- [ ] `schemas` feature: draft and published records, dnd-kit field
      reordering, live preview through `FormBuilder`, unsaved-changes
      warning via `useBlocker`. No longer waiting on the Zod decision

## Priority 1 — Blocking real usage

- [ ] **Stand up (or connect to) a real backend.** Everything currently
      talks to `VITE_API_BASE_URL`, which nothing is listening on outside
      of MSW's mocks. Nothing else on this list matters much until there's
      a real API to point at.
- [ ] Once a backend exists, decide how per-environment config works
      (staging vs. production `VITE_API_BASE_URL`) given that Docker
      currently bakes it in at build time (see ADR 0004). Either accept
      "one image per environment" or add a runtime-config-injection
      pattern if the same image needs to run against multiple APIs.

## Priority 2 — Harden the architecture before it's copied further

- [x] **ESLint import-boundary rule added** (`eslint-plugin-boundaries` +
      `boundaries/dependencies`, resolved via `eslint-import-resolver-typescript`).
      Verified: `feature → feature` cross-imports (e.g. `todos` importing
      `orders`' internals) now correctly fail lint. **Remaining gap:**
      `app → feature` is currently allowed to reach any file inside a
      feature, not restricted to its `index.ts` barrel specifically — the
      old `entry-point` rule that would have enforced this is deprecated
      in the installed plugin version with no confirmed migration syntax
      found yet. Revisit if this specific gap (app bypassing a feature's
      public barrel) becomes a real problem in practice.
- [x] **Build a second real feature** — since this item was written,
      `orders` and `notifications` were generated and routed, and `notes`
      exists as a third. Confirmed:
  - [x] Plop generator output now includes optional store/mutations
        (previously a known gap, closed — see build guide decision log)
  - [ ] Pre-commit hook, CI pipeline, and Docker build **not yet
        re-verified** with multiple features in the tree — CI and the
        test suite were removed entirely partway through this build (see
        "Removed for now" note in `BUILD_GUIDE.md` Phase 5/7) and have not
        been re-added. Worth doing once CI comes back.
  - [x] Cross-feature boundaries verified under real pressure — a
        deliberate `todos → orders` internal import was correctly blocked
        by the ESLint boundaries rule (see decision log)

## Priority 1.5 — Re-add what was deliberately removed

- [ ] **Re-add Vitest/RTL, all `.test.*` files, and the GitHub Actions CI
      workflow.** Both were fully built once (proven working, including a
      real CI failure caught and fixed — see `BUILD_GUIDE.md`'s Phase 5/7
      history) and then intentionally removed mid-build as "overkill for
      now." Now that routing, a hardened Plop generator suite, and the
      hand-written form builder validation are in place, the surface area
      worth testing has grown — this is worth prioritizing before the
      template sees much more use.
- [ ] Once tests are back, cover the opt-in runtime checks: a `parse`
      function passed to `request()` that rejects a malformed mock response,
      and `validateFormSchema` against malformed descriptions.

## Priority 3 — Keep mocks honest

- [ ] Once a real backend contract exists (OpenAPI spec or equivalent),
      revisit whether MSW handlers should be generated from it rather than
      hand-maintained, to stop them from silently drifting out of sync
      with reality (ADR 0003). The Bruno collection in the existing system
      is a candidate source.

## Priority 3.5 — Hardening (before calling this "foolproof")

**Runtime data safety**

- [x] ~~Add schema validation (zod or valibot) at the `api/` boundary.~~
      Superseded by ADR 0012: Zod was removed. Runtime checks are now
      opt-in per call through the `parse` option of `request()`.

**Security**

- [ ] Dependency vulnerability scanning — Dependabot/Renovate and/or
      `yarn audit` as a CI step
- [ ] Secret scanning — `gitleaks` as a pre-commit hook or CI step, to
      catch accidentally committed real credentials before they ship
- [ ] Security headers on nginx (CSP, `X-Frame-Options`,
      `X-Content-Type-Options`, etc.) — currently absent from `nginx.conf`

**Testing gaps**

- [ ] True E2E tests (Playwright or Cypress) against a real browser and
      the actual built app — everything so far runs in jsdom, not a
      real browser
- [ ] Accessibility testing — `eslint-plugin-jsx-a11y` (static) and/or
      `axe-core` in component tests (runtime)
- [ ] Bundle-size budget enforced in CI, so growth is caught automatically
      rather than relying on periodic manual checks

**Deployment realism**

- [ ] Deliberate staging/production strategy, given `VITE_*` vars are
      baked in at Docker build time (ADR 0004) — decide "one image per
      environment" vs. runtime config injection before this serves real
      users
- [ ] Branch protection on `main` requiring CI to pass before merge —
      currently nothing stops a direct push bypassing CI entirely

**Process/hygiene**

- [ ] `commitlint` + conventional commits (as a husky hook alongside
      lint-staged) — useful for changelogs/semver, and keeps history
      readable across every project spawned from this template
- [ ] PR and issue templates (`.github/PULL_REQUEST_TEMPLATE.md`, etc.) —
      worth the one-time cost given this repo is reused as a template

**Lower priority**

- [ ] Error-tracking service (Sentry or similar) wired into `ErrorBoundary`
      — currently a production error only reaches `console.error`, which
      nobody is watching
- [ ] Optimistic updates demonstrated in the `todos`/reference feature's
      mutations — common real-world pattern TanStack Query supports well,
      not yet shown anywhere in the reference implementation
- [ ] `robots.txt`, meta tags, favicon — cosmetic, but every real deployed
      app eventually needs them

## Priority 4 — Deferred by design (revisit when the need actually appears, not before)

- [x] TanStack Router — **wired up.** Root route + `Layout` (nav + `Outlet`)
      in `app/router/`, one route per feature, plus two Plop generators
      (`generate:route` for adding routing to an existing feature,
      `generate:feature` scaffolds routing automatically for new ones)
- [ ] TanStack Table — add if/when a real data-grid need appears
- [ ] TanStack Form — add if form complexity grows past plain controlled
      inputs
- [ ] TanStack Virtual — add if long lists appear
- [x] Framer Motion — **activated.** In use on `NavBar` (sliding active-item
      indicator) and `Sidebar` (spring-based collapse/expand), both
      responding to real user actions. Deliberately not used on `Footer`.

## Plop generator suite — now available

The generator brainstorm from this build is fully implemented. Reference
for what exists, so nobody rebuilds one that's already there:

- `yarn generate:feature` — full feature slice: types (plain interfaces), api,
  hooks, components, page, barrel, route + nav link, with prompts for an
  optional Zustand store and optional create/update/delete mutations
- `yarn generate:route` — add routing to an already-existing, unrouted
  feature
- `yarn generate:hook` — add one new mutation hook to an already-existing
  feature (requires the `// plop:mutation` and `// plop:handler` anchors in
  that feature's API and handlers files, and refuses to run without them)
- `yarn generate:adr` — new numbered ADR, auto-incrementing from
  `docs/adr/`'s existing files
- `yarn generate:component` — one component, in either an existing
  feature or `shared/ui`
- `yarn generate:web-app <name>` (repo root) — a new frontend from this
  template, with template-only content stripped

All generators run correctly from any folder, including the repo root.

## Documentation debt

- [x] **ADR filenames need cleanup.** Verified from the repo listing during
      the monorepo move: every ADR file is named `NNNN-kebab-case.md`. What
      remains (0008's slug, a possible 0011 and 0005 duplicate, the index)
      is tracked under Cleanup above.
- [ ] Worth a new ADR (or two) covering the routing/boundary-enforcement
      decision and the generator suite as a whole — use `yarn generate:adr`
      now that it exists, rather than creating the file by hand. Check
      0005, 0008 and 0011 first, since they may already cover this.
- [ ] `docs/BUILD_GUIDE.md`'s decision log is current as of this session;
      its phase checkboxes for Phase 5/7 (testing, CI) were deliberately
      reverted to unchecked to match the removal — don't re-check them
      until actually re-added, not just because the phase was "done" once.

## Optional / Quality-of-life

- [ ] `rollup-plugin-visualizer` for a visual bundle breakdown (offered,
      not needed yet — current bundle is clean)
- [ ] Confirm `docs/NEW_DEVELOPER_GUIDE.md` still reads accurately once a
      second feature and a real backend exist — update anything that was
      written against a single-feature, mock-only state of the project
