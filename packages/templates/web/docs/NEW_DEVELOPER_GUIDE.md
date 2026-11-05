# New Developer Guide

This app uses a feature-sliced architecture. Almost everything you need to
understand or change lives inside one folder under `src/features/<name>/`.

It is one workspace in a Yarn 4 monorepo. Shared tooling (the base TypeScript
and ESLint settings, Prettier and the git hooks) lives at the repo root;
everything specific to this app lives in this folder.

## 1. Mental model

```
src/
  app/        Providers, router, root layout. Touched rarely.
  shared/     Cross-feature code only. Kept deliberately small.
    ui/       Generic components, each in its own folder
    lib/      Generic non-UI logic (the API client, the theme context)
    config/   Environment variables, read through one typed `env` module
    form-builder/   Forms generated from a description (types, libs, hooks, components)
  features/
    <name>/
      api/         Calls through request(), typed with request<T>(). No business logic.
      services/    Pure transforms of API data. No React, no network.
      hooks/       useQuery and useMutation wrappers. The only place server
                   state is touched outside api/.
      store/       Client and UI state only (Zustand).
      components/  Presentational components that receive props.
      pages/       Route-level composition. Thin.
      types/       Domain types, as plain TypeScript interfaces.
      libs/        Feature-local pure helpers.
      index.ts     The feature's public surface.
  test/       Development mock worker (MSW)
```

Dependency direction inside a feature: `pages -> components -> hooks ->
services / api / store`. Data flows down, never sideways between features.

## 2. Where does my code go?

| I need to...                               | Put it in                                                           |
| ------------------------------------------ | ------------------------------------------------------------------- |
| Call an endpoint                           | `api/`, using `request()` from `shared/lib`                         |
| Check a response's shape at runtime        | `api/`, by passing a `parse` function to `request()`                |
| Reshape API data for the UI                | `services/`                                                         |
| Fetch or mutate data in a component        | `hooks/`                                                            |
| Store a filter, toggle or modal state      | `store/`                                                            |
| Store data that came from the server       | Nowhere. TanStack Query already has it                              |
| Build a feature-specific component         | `features/<name>/components/`                                       |
| Build a component two features would share | `shared/ui/<Name>/`                                                 |
| Compose a full screen                      | `pages/`                                                            |
| Add a route                                | `app/router/routes/`                                                |
| Define a domain type                       | Its contract in `@libs/types`; the feature's `types/` re-exports it |
| Mock an endpoint                           | the feature's `api/<name>Api.handlers.ts`                           |

Before adding anything to `shared/`, ask whether two unrelated features would
need it unchanged. If not, it belongs in the feature.

## 3. Starting work: use the generators

Do not copy folders by hand.

| Command                   | Use it to                                                                                                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn generate:feature`   | Scaffold a new feature, with optional store and mutations, plus its route and an optional nav link (top-level, in a dropdown group, or none) |
| `yarn generate:route`     | Add routing to a feature that exists but is not routed, with the same nav link choices                                                       |
| `yarn generate:hook`      | Add one mutation hook to an existing feature                                                                                                 |
| `yarn generate:component` | Add one component to a feature or to `shared/ui`                                                                                             |
| `yarn generate:adr`       | Record an architectural decision                                                                                                             |

Run them from this folder, or from the repo root with
`yarn workspace <package name> generate:feature`. They behave the same from
anywhere.

**Shared contracts.** `yarn generate:feature` asks whether to create the
feature's API contract in `@libs/types` (the default). Saying yes creates
`packages/libs/types/src/<name>/<name>.types.ts` with a Request/Response pair
for `getAll` and each mutation you tick, registers it in that package's index,
and types the feature's `api.ts` from it. If the file already exists, it is
reused. `yarn generate:hook` adds later mutations to the same contract file.
Both rely on two anchors in `@libs/types`, `// plop:contract-export` in
`src/index.ts` and `// plop:contract-mutation` in each contract file, and stop
before changing anything if either is missing. Generated contracts start with
`id` only: fill in the real fields and agree them with the API owners in the
pull request. Say no only for a feature with no API; it then gets a local
interface instead.

<!-- template-only:start -->

At the repo root, `yarn generate:web-app <name>` creates a new frontend from
this template. Content listed in `template.json`, or wrapped in the
template-only marker comments, exists only in the template and is removed
from generated apps.
<!-- template-only:end -->

Generators write files once. Changing a template does not fix files that were
already generated, so apply template fixes to existing files by hand.

The hook generator patches two files, a feature's `api.ts` and its mock
handlers file, through the anchor comments `// plop:mutation` and
`// plop:handler`. If a feature lacks either anchor, or has no handlers file,
the generator stops before changing anything and names the file. That matters
because Plop's `modify` otherwise reports success and does nothing. It also
assumes the names the feature generator produces, a type named after the feature
and a mock array called `items`, so use it on generated features. On a
hand-written feature, add the mutation by hand.

## 4. Server state and client state

- **Server state** is anything that came from an API. Use `useQuery` for
  reads and `useMutation` for writes, inside a feature's `hooks/`.
- **Client state** is a draft, a selected tab, a search box. Use Zustand in
  the feature's `store/`.

Ask: does this exist on the server? If yes, it is server state. Never copy
server data into a Zustand store, because two sources of truth drift apart.

## 5. Types and validation

Domain types come from the feature's API contract in `@libs/types`, shared
with the API, and the feature's `types/` re-exports them, so imports inside the
feature stay local (`../types`). A feature without an API keeps a plain
interface in `types/` instead. Either way, types exist at compile time only.
The type argument on `request<T>()` tells TypeScript what a response holds,
and `satisfies` checks each request body against its contract, but nothing
checks the response at runtime, so keep the contract in step with the real
API.

When a wrong shape would break something rather than just display oddly, pass a
`parse` function: `request({ path, parse })`. It receives the response and
returns it typed, or throws. Any function with that signature works, including
a hand-written guard.

Validation a person sees, such as a required title, belongs in the form. The
server must enforce it again, because the client can be bypassed.

Forms can be generated from a description with `FormBuilder` in
`shared/form-builder`. A description written in code is checked by the
compiler. One that arrives from an API must go through `parseFormSchema`
first, which rejects a malformed description and lists every problem:
`request({ path, parse: parseFormSchema })`. Field values are checked one field
at a time by `validateField`, so an error appears only on the field being
edited, and on every invalid field when the form is submitted.

## 6. Styling and theming

- Tailwind CSS v4. Configuration lives in CSS, not `tailwind.config.js`.
- Colours are semantic tokens defined in `src/index.css`: `background`,
  `foreground`, `muted`, `border`, `surface`, `accent`. Use these in
  components rather than raw colours, so re-skinning means editing one block.
- Dark mode is a `.dark` class on the root element, toggled by
  `ThemeProvider`. Use `useTheme()` to read or toggle it.
- Framer Motion is used only where motion answers a user action (the active
  nav indicator and sidebar collapse). Do not add decorative animation.

## 7. Routing

Route definitions live in `app/router/routes/`, one file per route, and are
registered in `app/router/router.ts`. Routes live in `app/`, not inside a
feature, because a feature may not import from `app`. A route imports its
page from the feature's `index.ts`.

Keep the `// plop:` anchor comments. The generators depend on them matching
exactly. `router.ts` needs `// plop:route-import` and `// plop:route-child`.
`Layout.tsx` needs `// plop:nav-icon-import` and `// plop:nav-link`, plus one
`// plop:nav-group:<slug>` for each dropdown group.

## 8. Feature boundaries and linting

ESLint enforces that a feature cannot import another feature's internals.
`yarn lint` fails if you try, and so does the commit hook, which runs ESLint
and Prettier on staged files.

The shared rules come from `eslint.config.base.js` at the repo root. This
package's `eslint.config.js` adds React and the boundary rules, with their paths
anchored to this folder, so lint gives the same result whether it starts here,
at the repo root or in the commit hook. If the rule ever seems silent, the cause
is usually module resolution, so check the boundaries settings in
`eslint.config.js` first.

## 9. The API client, authentication and access

The template has no authentication built in, on purpose (see the ADR on
authentication and access control). It provides seams instead.

**Making requests.** Features call `request()` from `@/shared/lib` rather than
`fetch`. It builds the URL from `VITE_API_BASE_URL`, parses the JSON, applies
the project's adapter and throws on failure. The type argument says what comes
back, as in `request<Todo[]>({ path })`. Three failures are worth telling apart:

- `ApiError` with `status` 0: the server could not be reached
- `ApiError` with an HTTP status: the server answered with an error, or sent a
  2xx response that is not valid JSON
- Whatever `parse` throws, when a call passes one, for example `FormSchemaError`

**Routes and verbs.** Every call is a POST, because the APIs this template is
built for use POST for reads as well as writes. Routes are named for the
action, as `/<feature>/<action>`, for example `/todos/getAll`. A feature's
`api.ts` builds its routes through one `route()` helper, so the prefix lives in
one place. Bodies are flat JSON, and a call with no parameters sends `{}`. If a
project names its routes differently, for example `getIrradiance` rather than
`getAll`, change the action strings in that feature's `api.ts`. Ids are named
`id` by default. A real feature may use a resource-specific key such as
`assetId`, which is a one-line change per method.

**Reads and actions.** With every call a POST, the verb no longer says whether
a call reads or writes. Decide by effect: an idempotent read is a query
(`useQuery`), and anything that acts is a mutation (`useMutation`). A POST that
triggers work, such as an import, must never be a query, because queries
refetch on window focus and reconnect.

**Adapting it to a backend.** One file, `src/app/api/setupApi.ts`, calls
`configureApi`, and `main.tsx` calls `setupApi()` once at startup, before any
request can run. It has five optional hooks: `prepareRequest` (where a token
goes: a header, the body, or cookies via `credentials`), `unwrapResponse`
(reading data out of an envelope, or throwing an `ApiError` for a failure sent
inside a 2xx response), `extractError`, `onUnauthorized` and `onForbidden`. The
defaults are bare JSON and no auth.

<!-- template-only:start -->

`docs/examples/existing-system-adapter.ts` is a complete worked example for one
real backend. It is not compiled by `yarn typecheck`, so check it still builds
before relying on it.
<!-- template-only:end -->

**Where the session lives.** That is a project decision. One rule always
applies: a token and its expiry are client state, but the user's profile and
permissions are server data. Put those in a TanStack Query hook and do not copy
them into a store.

**Hiding things.** Filter the `items` array in `Layout.tsx` before it reaches
the navbar, using whatever access model the project has. Hiding a link is
display only. The server must enforce access.

**Guarding routes.** Use `beforeLoad` on a route, or on the root route, to
redirect when there is no session. Define guards in `app/router/`, because a
feature may not import from `app/`:

```ts
beforeLoad: () => {
  if (!isSignedIn()) throw redirect({ to: '/login' })
}
```

**Mocks.** MSW handlers must listen for the same route and verb the client
sends, which is a POST to `/<feature>/<action>`, and return exactly what the
configured backend returns, envelope included. Build handler URLs from
`env.API_ADDRESS`, the same base `request()` uses, never from a hardcoded
address: then they match whatever `VITE_API_BASE_URL` holds, including blank.
A handler that does not match lets the request fall through to the network,
where in development it fails with only a console warning.

## 10. Environment variables

Vite exposes only variables prefixed `VITE_`. Copy `.env.example` to `.env` to
set values. `.env` is never committed. In development it is optional: with a
blank `VITE_API_BASE_URL`, requests and mock handlers both use the page's own
address. `VITE_*` values are baked in at build time, so a Docker image cannot
be repointed at another API without a rebuild.

`VITE_ENABLE_MOCKS` switches the mock layer on. Development always mocks. A
production build mocks only when built with `VITE_ENABLE_MOCKS=true`, which is
how a demo image is made. Left unset, the mock library is removed from the
bundle.

Read variables through `env` from `@/shared/config`, not `import.meta.env`. It gives
each value a name and a type: `env.API_ADDRESS`, `env.ENV_MODE` (`development`,
`production`, or the name given with `--mode`, such as `staging`), `env.IS_DEV`
and `env.IS_PROD`. Two traps:

- A variable without a `VITE_` prefix is never exposed to the browser, so it is
  always `undefined`, whatever is set.
- `env` must not decide whether code ships. A condition that goes through it is
  invisible to the bundler, so a guarded branch stays in the production bundle.
  Anything that must be absent from production, such as the mock library, keeps
  `import.meta.env.DEV` written out at the guard.

`IS_PROD` is true for every build, so it cannot tell staging from production. For
that, build with `yarn build --mode staging` and read `env.ENV_MODE`.

## 11. Docker

Images are built from the repo root, with this app's Dockerfile in
`hosting/docker/<app>/`. From the repo root:

```bash
yarn docker:<app>:build    # build the image
yarn docker:<app>:verify   # build, run and check it
```

<!-- template-only:start -->

For the template itself, use `yarn docker:template:build`,
`yarn docker:template:run` and `yarn docker:template:verify`.
<!-- template-only:end -->

`.env` is not copied into the image, so `VITE_*` values are passed as build
arguments:

```bash
# production: calls a real API, no mock layer
docker build -f hosting/docker/<app>/Dockerfile \
  --build-arg VITE_API_BASE_URL=https://api.example.com/api -t <image> .

# demo: runs on mock data with no backend, tagged separately so it cannot be
# mistaken for production
docker build -f hosting/docker/<app>/Dockerfile \
  --build-arg VITE_ENABLE_MOCKS=true -t <image>-demo .
```

A demo image needs no API address, because the mock handlers build on the same
base as `request()`. A production image built without `VITE_API_BASE_URL` has
no API address, so a container failing to load data is expected there, not a
fault in the image. The verify script checks production images, so it reports
a demo image's mock layer as a failure.

## 12. Running things

```bash
yarn install      # once, from the repo root
yarn dev          # development server with mock data
yarn build        # type-check and production build
yarn lint         # ESLint
yarn typecheck    # tsc --noEmit
yarn format       # Prettier
```

From the repo root, the same commands exist as `yarn run:<app>`,
`yarn build:<app>`, `yarn lint:<app>` and `yarn typecheck:<app>`.

## 13. Testing status

There is no automated test suite or CI at present. Both were built and proven
earlier, then removed, and their return is deferred. Verify changes with
`yarn typecheck`, `yarn lint` and `yarn dev`.

## 14. Common mistakes

- Importing another feature's internal files instead of its `index.ts`
- Putting server data into Zustand for convenience
- Business logic in `pages/`. Pages should only compose
- Putting a one-off component in `shared/`
- Adding a route inside a feature rather than in `app/router/`
- Retyping a `// plop:` anchor comment instead of copying it exactly
- Calling `fetch` directly in a feature instead of using `request()`
- Giving a mock handler its own hardcoded address instead of `env.API_ADDRESS`
- Editing the root's shared config for one app's needs; override in this
  package's own config instead
- Skipping the generator and hand-rolling a feature folder

## 15. Where to look when lost

For one specific decision, check `docs/adr/`. Decisions about the whole repo,
such as the monorepo layout, are in the root `docs/adr/`.

<!-- template-only:start -->

For how the template was built and why, start with `docs/BUILD_GUIDE.md`. For
what is still open, see `docs/NEXT_STEPS_CHECKLIST.md`. In development, the
in-app guide walks through the template with code read live from the project,
and shows this file as its developer guide chapters.
<!-- template-only:end -->
