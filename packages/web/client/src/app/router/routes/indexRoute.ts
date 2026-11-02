import { createRoute, redirect } from '@tanstack/react-router'
import { rootRoute } from './rootRoute'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/todos' })
  },
})
