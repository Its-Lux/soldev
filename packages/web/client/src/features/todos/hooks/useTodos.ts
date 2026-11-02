import { useQuery } from '@tanstack/react-query'
import { todosApi } from '../api/todosApi'
import { todosKeys } from './queryKeys'

export function useTodos() {
  return useQuery({
    queryKey: todosKeys.lists(),
    queryFn: todosApi.getAll,
  })
}
