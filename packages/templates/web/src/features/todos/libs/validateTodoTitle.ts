export function validateTodoTitle(title: string): string | null {
  if (title.trim().length === 0) return 'Title cannot be empty'
  if (title.length > 200) return 'Title is too long'
  return null
}
