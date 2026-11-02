import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './rootRoute'
import { TodosPage } from '@/features/todos'

export const todosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/todos',
  component: TodosPage,
})
