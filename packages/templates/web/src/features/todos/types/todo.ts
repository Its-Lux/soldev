// The todos contract is shared with the API through @libs/types, so the two
// cannot drift apart. These are compile-time types only: nothing checks at
// runtime that the server actually sends these shapes.
export type { CreateTodoRequest as CreateTodoInput, Todo, TodoDetail } from '@libs/types'
