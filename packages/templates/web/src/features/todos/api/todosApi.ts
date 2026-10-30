import { request } from '@/shared/lib'
import type { CreateTodoInput, Todo, TodoDetail } from '../types'

// Every route is a POST named for its action, for example /todos/getAll.
const route = (action: string) => `/todos/${action}`

// The type argument on request<T>() tells TypeScript what the server returns.
// It is not checked at runtime, so keep it in step with the real API.
export const todosApi = {
  getAll: (): Promise<Todo[]> => request<Todo[]>({ path: route('getAll') }),

  getById: (id: string): Promise<TodoDetail> =>
    request<TodoDetail>({ path: route('getById'), body: { id } }),

  create: (input: CreateTodoInput): Promise<Todo> =>
    request<Todo>({ path: route('create'), body: input }),

  toggle: (id: string): Promise<Todo> => request<Todo>({ path: route('toggle'), body: { id } }),

  delete: (id: string): Promise<void> => request({ path: route('delete'), body: { id } }),
}
