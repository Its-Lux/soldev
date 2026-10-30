import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './rootRoute'
import { SitesPage } from '@/features/sites'

export const sitesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sites',
  component: SitesPage,
  staticData: { fullBleed: true },
})
