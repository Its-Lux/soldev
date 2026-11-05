import type { EmptyRequest } from '../api/envelope.js'
import type { IdRequest, IsoDateString } from '../common/primitives.js'

/**
 * Reference domain, matching the template's todos feature and its mocks.
 * One file per route prefix; one Request/Response pair per action.
 * Responses are payloads, as features receive them after unwrapResponse.
 */

/** The summary: what a list needs. */
export interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: IsoDateString
}

/** The detail: the summary plus fields only a single-record view needs. */
export interface TodoDetail extends Todo {
  description: string
  updatedAt: IsoDateString
}

// POST /todos/getAll
export type GetAllTodosRequest = EmptyRequest
export type GetAllTodosResponse = Todo[]

// POST /todos/getById
export type GetTodoByIdRequest = IdRequest
export type GetTodoByIdResponse = TodoDetail

// POST /todos/create
export interface CreateTodoRequest {
  title: string
}
export type CreateTodoResponse = Todo

// POST /todos/toggle
export type ToggleTodoRequest = IdRequest
export type ToggleTodoResponse = Todo

// POST /todos/delete (204, no body)
export type DeleteTodoRequest = IdRequest
export type DeleteTodoResponse = void
