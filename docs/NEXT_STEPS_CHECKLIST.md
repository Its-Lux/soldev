# Next Steps Checklist

Everything below is genuinely open — not covered by the base app build. Use
this to pick up where this conversation left off, in a new chat or project.
Reference `docs/BUILD_GUIDE.md` and `docs/adr/` for the reasoning behind
anything here that needs more context.

## Current roadmap: making the template foolproof

This section is the live plan and takes precedence over older sections below
where they overlap. Work through it in order, confirming each step.

**Deferred by management, not by choice**

- [ ] Automated tests and CI. Declined for now. Before this can return, a
      lighter setup needs designing. Seed idea: Vitest only, covering pure
      logic (services, libs, zod schemas, the form builder's schema
      functions), with no jsdom, no React Testing Library and no MSW node
      server, run locally with `yarn test` and no pipeline.

**Cleanup (do first, cheap and visible)**

- [x] Remove the throwaway features (`orders`, `notifications`, `notes`),
      their route files, nav entries and any handler registrations
- [x] Bring `README.md` and `NEW_DEVELOPER_GUIDE.md` in line with reality
      (both still describe tests and CI as present)
- [ ] ADRs. Confirmed from the owner's listing: 0001 to 0005 are correctly
      named (0005 already covers routing and boundaries), and 0006 and 0007
      exist for the auth seams and POST-only decisions. Still to generate:
      the generator suite, theme and charts, and the form builder, whose
      bodies are in `housekeeping/adr/` and will become 0008 to 0010. Also
      check that 0006's filename matches its content, and that the README
      index lists 0006 to 0010
- [ ] Re-verify the Docker build with everything added since it last ran.
      `housekeeping/scripts/verify-docker.sh` delivered, its logic tested
      against stand-ins for docker and curl only. Awaiting a real run, the
      `Dockerfile` and `nginx.conf` for review, a `docker:verify` script in
      `package.json`, and `*.sh text eol=lf` in `.gitattributes`
- [ ] The Docker image runs the mock layer. Cause found: the
      `import.meta.env.DEV` guard in `main.tsx` was commented out, so MSW
      started in every build, and the build had no API address because
      `.env` is not copied into the image. Fix delivered and verified on
      real Vite 8 builds: `main.tsx` (mock when DEV, or when built with
      `VITE_ENABLE_MOCKS=true`) and a `Dockerfile` taking `VITE_API_BASE_URL`
      and `VITE_ENABLE_MOCKS` as build arguments. Awaiting the owner
      replacing both, rebuilding, and running the verify script (and with
      `DEMO=1` for a demo image). Also: add `readonly VITE_ENABLE_MOCKS?:
    string` to `vite-env.d.ts`, document the flag in `.env.example`, and
      optionally add `docker:build:demo` and `docker:run:demo` scripts
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
      auth. Working: `todos` runs on it. Not yet confirmed: that `setupApi()`
      is called in `main.tsx`
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
- [ ] A `radio` field type for the form builder, using `RadioGroup`. It
      touches the Zod-based builder, so wait for the Zod decision

**Generator follow-ups**

- [ ] Make the hook generator tolerate CRLF. Every document, template and the
      plopfile uploaded so far is CRLF while `.editorconfig` says LF, so the
      hook generator's pattern very probably does nothing on this machine.
      Confirmed with real Plop: on a CRLF feature the current generator
      reports success, adds no method, and still creates a hook that
      calls the missing one. Fixed block delivered as
      `hook-generator-block.txt`, awaiting paste. Also settle line
      endings across the repo
- [ ] Review the five nav templates and generate a test group to confirm
      the `existingGroup` path re-emits its anchor
- [ ] Refresh the packaged skill. Rebuilt and validated as
      `vite-react-feature-sliced-builder.skill`: corrected the working-style rule
      about who creates files, rewrote the generator reference, and added
      references for the API client and for verifying deliveries. Awaiting
      installation
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
      paste). Still to confirm: the hook generator block, and a test run
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
  response needs its own schema
- Still unknown: the 401, 403 and general error response shapes, the values
  of `permissionType`, what `user.assets` holds, and what PERPROJECT means
  (read as: no blanket client access, access comes from asset roles)

**Open decisions**

- Zod or plain TypeScript for runtime validation. Undecided. It affects every
  feature's `types/` and `api/`, the generators and, most of all, the form
  builder, which uses Zod to build input validators and to validate a form
  description that comes from the backend. A parser-agnostic API client would
  keep the choice open per project
  Measured with a grep for imports of Zod in `src`: five files today. They
  are the `todos` types and API, the form builder's `types.ts` and
  `buildFieldValuesSchema.ts`, and the API client (a type-only import). The
  three generator templates use it too. The cost grows with every endpoint
  added, so it is cheapest to decide before more features exist.
  The owner is testing first and will decide in a few days. Make no Zod
  changes until then
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
      warning via `useBlocker`

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
      now." Now that routing, a hardened Plop generator suite, and zod
      validation are in place, the surface area worth testing has grown —
      this is worth prioritizing before the template sees much more use.
- [ ] Once tests are back, apply the schema-validation pattern (Priority
      3.5 below) and its verification test to `orders`/`notifications`/
      `notes`, not just `todos`.

## Priority 3 — Keep mocks honest

- [ ] Once a real backend contract exists (OpenAPI spec or equivalent),
      revisit whether MSW handlers should be generated from it rather than
      hand-maintained, to stop them from silently drifting out of sync
      with reality (ADR 0003).

## Priority 3.5 — Hardening (before calling this "foolproof")

**Runtime data safety**

- [x] Add schema validation (zod or valibot) at the `api/` boundary —
      done for `todos` (types derived via `z.infer`, `.parse()` on both
      response and mutation input). Verified with a deliberately malformed
      mock response; error correctly surfaces through the existing
      `useQuery`/`isError` path. **Follow-up:** apply the same pattern to
      `orders` and `notifications` once they're built out as real features
      rather than generator throwaways.

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

- `yarn generate:feature` — full feature slice: types (zod-backed), api,
  hooks, components, page, barrel, route + nav link, with prompts for an
  optional Zustand store and optional create/update/delete mutations
- `yarn generate:route` — add routing to an already-existing, unrouted
  feature
- `yarn generate:hook` — add one new mutation hook to an already-existing
  feature (requires the `// plop:mutation` anchor in that feature's
  `api.ts` — only present on features generated after this was added;
  `todos`/`orders`/`notifications` would need it added by hand)
- `yarn generate:adr` — new numbered ADR, auto-incrementing from
  `docs/adr/`'s existing files
- `yarn generate:component` — one component, in either an existing
  feature or `shared/ui`

## Documentation debt

- [ ] **ADR filenames need cleanup.** `0001-0004` were hand-created from
      downloaded files and ended up with spaces instead of dashes (e.g.
      `0001 feature sliced architecture.md`), and `0002` picked up a wrong
      filename along the way (content may still be correct — verify before
      renaming). A new `0005` ADR (routing + ESLint boundary enforcement,
      content already drafted in this conversation) also needs renaming
      from `0001-...` to `0005-...` since it was generated before `0001-0004`
      were actually present on disk. Rename all five to consistent
      `NNNN-kebab-case-with-dashes.md`, update `0005`'s internal heading
      number, and add its row to `docs/adr/README.md`'s index. Deliberately
      paused mid-fix — pick back up when convenient.
- [ ] Worth a new ADR (or two) covering the routing/boundary-enforcement
      decision and the generator suite as a whole — use `yarn generate:adr`
      now that it exists, rather than creating the file by hand.
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
