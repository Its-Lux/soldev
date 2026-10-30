import { useQueries } from '@tanstack/react-query'
import { loadSource } from '../libs/sources'
import { guideKeys } from './queryKeys'

/** Loads the text of every given file, in parallel, through TanStack Query. */
export function useSources(paths: string[]) {
  return useQueries({
    queries: paths.map((path) => ({
      queryKey: guideKeys.source(path),
      queryFn: () => loadSource(path),
      staleTime: Infinity,
    })),
    combine: (results) => {
      const sources = new Map<string, string>()
      results.forEach((result, index) => {
        const path = paths[index]
        if (path !== undefined && result.data !== undefined) sources.set(path, result.data)
      })
      return { sources, isPending: results.some((result) => result.isPending) }
    },
  })
}
