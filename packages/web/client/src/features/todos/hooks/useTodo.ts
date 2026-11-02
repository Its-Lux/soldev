import { useQuery } from '@tanstack/react-query'
import { todosApi } from '../api/todosApi'
import { todosKeys } from './queryKeys'

export function useTodo(id: string) {
  return useQuery({
    queryKey: todosKeys.detail(id),
    queryFn: () => todosApi.getById(id),
  })
}
