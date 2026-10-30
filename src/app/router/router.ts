import { createRouter } from '@tanstack/react-router'
import { rootRoute } from './routes/rootRoute'
import { indexRoute } from './routes/indexRoute'
// Note: The following imports are used by plop to add new routes. Do not remove them.
// plop:route-import
import { sitesRoute } from './routes/sitesRoute'
import { todosRoute } from './routes/todosRoute'
import { todoDetailRoute } from './routes/todoDetailRoute'
import { guideRoute } from './routes/guideRoute'

const routeTree = rootRoute.addChildren([
  indexRoute,
  // Note: The following imports are used by plop to add new routes. Do not remove them.
  // plop:route-child
  sitesRoute,
  todosRoute,
  todoDetailRoute,
  ...(import.meta.env.DEV ? [guideRoute] : []),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
