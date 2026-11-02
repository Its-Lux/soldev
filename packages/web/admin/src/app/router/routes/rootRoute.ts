import { createRootRoute } from '@tanstack/react-router'
import { Layout } from '@/app/layout/Layout'

export const rootRoute = createRootRoute({
  component: Layout,
})
