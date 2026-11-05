# @libs/types

Shared API contract types for the frontends and the API.

## Rules

1. **Types only.** No runtime code: no values, enums, functions or classes.
   `src/index.ts` re-exports with `export type *`, so a value added here
   cannot be used by consumers anyway.
2. **Contract types only.** Never export database entities; `libs/data` maps
   entities to these types.
3. **JSON-safe.** Everything must survive `JSON.stringify`: no `Date` (use
   `IsoDateString`), no `bigint`, no class instances.
4. **One file per route prefix** (`src/<prefix>/<prefix>.types.ts`), with one
   Request/Response pair per action, named `<Action><Domain>Request` and
   `<Action><Domain>Response`. Responses describe the payload, as features
   receive it after `unwrapResponse`. Backends that wrap payloads compose
   `ApiResponse<Key, Payload>`.
5. **`.js` extensions on internal imports.** The package type-checks with
   `module: nodenext`, which enforces this, so it works for both Vite
   frontends and the Node API.
6. **Consumers use `import type`.**

## Adding a domain

1. Create `src/<prefix>/<prefix>.types.ts`.
2. Add `export type * from './<prefix>/<prefix>.types.js'` to `src/index.ts`.
3. Run `yarn typecheck:types` from the repo root.
