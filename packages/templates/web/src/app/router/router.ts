import { createRouter } from '@tanstack/react-router'
import { rootRoute } from './routes/rootRoute'
import { indexRoute } from './routes/indexRoute'
// Note: The following imports are used by plop to add new routes. Do not remove them.
// plop:route-import
import { todosRoute } from './routes/todosRoute'
import { todoDetailRoute } from './routes/todoDetailRoute'
// template-only:start
import { guideRoute } from './routes/guideRoute'
// template-only:end

const routeTree = rootRoute.addChildren([
  indexRoute,
  // Note: The following imports are used by plop to add new routes. Do not remove them.
  // plop:route-child
  todosRoute,
  todoDetailRoute,
  // template-only:start
  ...(import.meta.env.DEV ? [guideRoute] : []),
  // template-only:end
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
