import { request } from '@/shared/lib'
import type { SiteDetail, SiteSummary } from '../types'

// Every route is a POST named for its action, for example /sites/getAll.
const route = (action: string) => `/sites/${action}`

// The type argument on request<T>() tells TypeScript what the server returns.
// It is not checked at runtime, so keep it in step with the real API.
export const sitesApi = {
  getAll: (): Promise<SiteSummary[]> => request<SiteSummary[]>({ path: route('getAll') }),
  getById: (id: string): Promise<SiteDetail> =>
    request<SiteDetail>({ path: route('getById'), body: { id } }),
  // plop:mutation
}
