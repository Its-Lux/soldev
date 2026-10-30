import type { Chapter } from '../../types'

export const mapChapter: Chapter = {
  id: 'map',
  title: 'The map',
  summary: 'Where code lives, and which way dependencies point.',
  blocks: [
    {
      kind: 'text',
      body: 'The template is split by **feature**, not by file type. Everything one feature needs (its API calls, hooks, components, pages and types) lives under `src/features/<name>/`. Two other top-level folders exist: `src/app/` for the shell (providers, router, layout) and `src/shared/` for code that more than one feature genuinely needs.',
    },
    {
      kind: 'text',
      body: '`todos` is the reference feature: it uses every layer, so it is the model to follow.',
    },
    {
      kind: 'tree',
      root: '/src/features/todos/',
      caption: 'The todos feature, read live from the project',
    },
    {
      kind: 'text',
      body: 'Inside a feature, dependencies point one way: `pages` compose `components` and call `hooks`; hooks call `services`, the API and the store; components only receive props. Features never import each other, and ESLint enforces it: `yarn lint` fails if one feature reaches into another.',
    },
    {
      kind: 'text',
      body: 'Features do not call `fetch` directly. They call `request()` from `@/shared/lib`, which builds the URL, sends the call as a POST and throws an `ApiError` on failure. The caller says what comes back with a type argument, `request<Todo[]>()`, and the response is checked at runtime only when the caller also passes a `parse` function. One file, `src/app/api/setupApi.ts`, adapts it to a particular backend.',
    },
    {
      kind: 'tree',
      root: '/src/shared/lib/',
      caption: 'Shared non-UI code: the API client, the theme, generic hooks',
    },
    {
      kind: 'note',
      body: 'Before anything moves to `shared/`, ask: would two unrelated features need it unchanged? If not, it belongs in the feature. A component one feature uses stays in that feature, even if it looks reusable.',
    },
  ],
}
