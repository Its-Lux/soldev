// Plain TypeScript types. They exist at compile time only: nothing checks at
// runtime that the server actually sends these shapes.

// The summary: what a list needs, and nothing more.
export interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: string
}

// The detail: the summary plus fields only a single-record view needs.
export interface TodoDetail extends Todo {
  description: string
  updatedAt: string
}

export interface CreateTodoInput {
  title: string
}
