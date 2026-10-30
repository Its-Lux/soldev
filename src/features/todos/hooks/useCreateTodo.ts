import { useMutation, useQueryClient } from '@tanstack/react-query'
import { todosApi } from '../api/todosApi'
import { todosKeys } from './queryKeys'

export function useCreateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: todosApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosKeys.lists() })
    },
  })
}
