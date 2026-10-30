import { skipToken, useQuery } from '@tanstack/react-query'
import { sitesApi } from '../api/sitesApi'
import { sitesKeys } from './queryKeys'

/**
 * Detail for one site. Pass null when nothing is selected: the query then
 * stays idle and makes no request.
 */
export function useSite(id: string | null) {
  return useQuery({
    queryKey: sitesKeys.detail(id ?? ''),
    queryFn: id ? () => sitesApi.getById(id) : skipToken,
  })
}
