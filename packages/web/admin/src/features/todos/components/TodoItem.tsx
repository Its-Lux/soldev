import type { Todo } from '../types'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onOpen?: (id: string) => void
}

export function TodoItem({ todo, onToggle, onDelete, onOpen }: TodoItemProps) {
  const titleClass = todo.completed ? 'line-through text-gray-400' : ''

  return (
    <li className="flex items-center gap-2 py-2">
      <input type="checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)} />
      {onOpen ? (
        <button
          type="button"
          onClick={() => onOpen(todo.id)}
          className={`text-left hover:underline ${titleClass}`}
        >
          {todo.title}
        </button>
      ) : (
        <span className={titleClass}>{todo.title}</span>
      )}
      <button onClick={() => onDelete(todo.id)} className="ml-auto text-red-500">
        Delete
      </button>
    </li>
  )
}
