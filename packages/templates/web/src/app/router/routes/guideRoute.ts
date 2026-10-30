import { createRoute, lazyRouteComponent } from '@tanstack/react-router'
import { rootRoute } from './rootRoute'

export const guideRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/guide',
  component: import.meta.env.DEV
    ? lazyRouteComponent(() => import('@/features/guide'), 'GuidePage')
    : () => null,
})
