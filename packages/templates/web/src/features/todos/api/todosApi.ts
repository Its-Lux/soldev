import type {
  CreateTodoRequest,
  CreateTodoResponse,
  DeleteTodoRequest,
  DeleteTodoResponse,
  GetAllTodosRequest,
  GetAllTodosResponse,
  GetTodoByIdRequest,
  GetTodoByIdResponse,
  ToggleTodoRequest,
  ToggleTodoResponse,
} from '@libs/types'
import { request } from '@/shared/lib'

// Every route is a POST named for its action, for example /todos/getAll.
const route = (action: string) => `/todos/${action}`

// Request and response types come from the shared contract in @libs/types.
// `satisfies` checks each body against it; the type argument on request<T>()
// says what comes back. Neither is checked at runtime.
export const todosApi = {
  getAll: (): Promise<GetAllTodosResponse> =>
    request<GetAllTodosResponse>({
      path: route('getAll'),
      body: {} satisfies GetAllTodosRequest,
    }),

  getById: (id: string): Promise<GetTodoByIdResponse> =>
    request<GetTodoByIdResponse>({
      path: route('getById'),
      body: { id } satisfies GetTodoByIdRequest,
    }),

  create: (input: CreateTodoRequest): Promise<CreateTodoResponse> =>
    request<CreateTodoResponse>({ path: route('create'), body: input }),

  toggle: (id: string): Promise<ToggleTodoResponse> =>
    request<ToggleTodoResponse>({
      path: route('toggle'),
      body: { id } satisfies ToggleTodoRequest,
    }),

  delete: (id: string): Promise<DeleteTodoResponse> =>
    request<DeleteTodoResponse>({
      path: route('delete'),
      body: { id } satisfies DeleteTodoRequest,
    }),
}
