import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './rootRoute'
import { TodoDetailPage } from '@/features/todos'

export const todoDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/todos/$id',
  component: TodoDetailPage,
})
