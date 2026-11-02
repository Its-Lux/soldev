import type { Todo } from '../types'
import { TodoItem } from './TodoItem'

interface TodoListProps {
  todos: Todo[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onOpen?: (id: string) => void
}

export function TodoList({ todos, onToggle, onDelete, onOpen }: TodoListProps) {
  if (todos.length === 0) {
    return <p className="text-gray-400">No todos yet.</p>
  }

  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onOpen={onOpen}
        />
      ))}
    </ul>
  )
}
