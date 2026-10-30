import { useQuery } from '@tanstack/react-query'
import { sitesApi } from '../api/sitesApi'
import { sitesKeys } from './queryKeys'

export function useSites() {
  return useQuery({
    queryKey: sitesKeys.lists(),
    queryFn: sitesApi.getAll,
  })
}
