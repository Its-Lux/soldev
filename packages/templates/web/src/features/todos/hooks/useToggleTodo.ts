import { useMutation, useQueryClient } from '@tanstack/react-query'
import { todosApi } from '../api/todosApi'
import { todosKeys } from './queryKeys'

export function useToggleTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: todosApi.toggle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosKeys.all })
    },
  })
}
