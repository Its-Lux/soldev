import type { Chapter } from '../../types'

export const generatorsChapter: Chapter = {
  id: 'generators',
  title: 'Generators',
  summary: 'How `yarn generate:feature` turns answers into a feature.',
  blocks: [
    {
      kind: 'text',
      body: '`yarn generate:feature` runs the `feature` generator in `plopfile.js`. It asks every question first, then runs a list of **actions** in order. `add` creates a file from a template, `append` inserts a template after an anchor comment in an existing file, and an action with `skip` runs only when `skip` returns nothing.',
    },
    {
      kind: 'snippet',
      path: '/plopfile.js',
      from: "plop.setGenerator('feature'",
      to: '// Generator for creating a new route',
      caption: 'The feature generator',
    },
    {
      kind: 'text',
      body: "Each template is Handlebars: `{{name}}` is the answer as typed, and helpers such as `{{pascalCase name}}` reshape it. The plopfile adds two helpers of its own. `includes` is how `api.hbs` decides which mutation methods to write, and `eq` picks one branch in the hook generator's templates.",
    },
    {
      kind: 'snippet',
      path: '/plopfile.js',
      from: "plop.setHelper('includes'",
      to: 'const navLinkPrompts',
      caption: 'Custom Handlebars helpers',
    },
    {
      kind: 'text',
      body: 'The generated data layer starts with a plain TypeScript interface. It exists at compile time only: nothing checks at runtime that the server sends that shape, so keep it in step with the real API.',
    },
    { kind: 'snippet', path: '/plop-templates/types.hbs', caption: 'types.hbs' },
    {
      kind: 'text',
      body: 'The API template calls `request()` from `@/shared/lib`, never `fetch`. Every route is a POST named for its action, such as `/<name>/getAll`, and the type argument on `request<T>()` tells TypeScript what comes back. A call that must be checked at runtime passes a `parse` function instead, for example `parseFormSchema` from the form builder. A server error becomes a thrown `ApiError`, which TanStack Query surfaces as `isError`.',
    },
    { kind: 'snippet', path: '/plop-templates/api.hbs', caption: 'api.hbs' },
    {
      kind: 'text',
      body: 'Reads go through a query key factory and a `useQuery` wrapper. The factory keeps keys consistent, which matters when a mutation needs to invalidate them.',
    },
    { kind: 'snippet', path: '/plop-templates/queryKeys.hbs', caption: 'queryKeys.hbs' },
    { kind: 'snippet', path: '/plop-templates/useFeature.hbs', caption: 'useFeature.hbs' },
    {
      kind: 'text',
      body: "Last come the barrel (the feature's public surface) and the route. Routes live in `src/app/`, because a feature may not import from `app`; the route imports the page through the barrel.",
    },
    { kind: 'snippet', path: '/plop-templates/barrel.hbs', caption: 'barrel.hbs' },
    { kind: 'snippet', path: '/plop-templates/route.hbs', caption: 'route.hbs' },
    {
      kind: 'text',
      body: 'Generated code is a starting point. No generator writes detail routes yet, so the todo detail route, which reads an `$id` parameter, was written by hand:',
    },
    {
      kind: 'snippet',
      path: '/src/app/router/routes/todosRoute.ts',
      caption: 'The todo detail route, written by hand',
    },
    {
      kind: 'text',
      body: 'Generators can also edit existing files. They find their place through anchor comments: the new route is appended after `// plop:route-child` in `router.ts`, and the nav link after `// plop:nav-link` in `Layout.tsx`. Retype an anchor even slightly and the append silently does nothing.',
    },
    {
      kind: 'snippet',
      path: '/src/app/layout/Layout.tsx',
      from: 'const items = [',
      to: '  ]',
      caption: 'Nav items in Layout.tsx, with the anchor the generator appends after',
    },
    { kind: 'snippet', path: '/plop-templates/navLink.hbs', caption: 'navLink.hbs' },
    {
      kind: 'text',
      body: "`yarn generate:hook` adds one mutation to an existing feature. It patches two files, the feature's `api.ts` and its mock handlers, through `// plop:mutation` and `// plop:handler`. If either anchor is missing it stops before changing anything, because Plop's `modify` would otherwise report success and do nothing.",
    },
    {
      kind: 'snippet',
      path: '/plopfile.js',
      from: "plop.setGenerator('hook'",
      to: '// Component generator',
      caption: 'The hook generator and its anchor check',
    },
    {
      kind: 'note',
      body: 'Three lessons from building this template. The hook generator assumes the names the feature generator produces, a type named after the feature and a mock array called `items`, so it suits generated features, not hand-written ones such as `sites`. A page reached from inside a feature, such as a detail page, needs the "No nav link" option when its route is generated. And `handlers.hbs` hardcodes `http://localhost:3000/api/{{name}}` while `request()` reads `VITE_API_BASE_URL`, so if the two ever differ, mocks stop intercepting without any error.',
    },
    {
      kind: 'text',
      body: "The optional store is off by default, because client state is the exception. Its template shows the kind of state Zustand is for: UI state such as a search box or a selected tab, never data that came from the server, which stays in TanStack Query's cache.",
    },
    { kind: 'snippet', path: '/plop-templates/store.hbs', caption: 'store.hbs' },
  ],
}
