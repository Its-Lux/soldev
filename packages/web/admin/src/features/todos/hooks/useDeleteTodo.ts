import { useMutation, useQueryClient } from '@tanstack/react-query'
import { todosApi } from '../api/todosApi'
import { todosKeys } from './queryKeys'

export function useDeleteTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: todosApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosKeys.all })
    },
  })
}
