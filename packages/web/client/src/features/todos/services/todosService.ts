import type { Todo } from '../types'

export function sortByNewest(todos: Todo[]): Todo[] {
  return [...todos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function getCompletionStats(todos: Todo[]) {
  const completed = todos.filter((t) => t.completed).length
  return {
    completed,
    total: todos.length,
    percentage: todos.length === 0 ? 0 : Math.round((completed / todos.length) * 100),
  }
}
