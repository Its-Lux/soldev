import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useCreateTodo } from '../hooks/useCreateTodo'
import { useDeleteTodo } from '../hooks/useDeleteTodo'
import { useToggleTodo } from '../hooks/useToggleTodo'
import { useTodos } from '../hooks/useTodos'
import { sortByNewest } from '../services/todosService'
import { TodoList } from '../components/TodoList'
import { useTodosUiStore } from '../store/useTodosUiStore'
import { Input, Button } from '@/shared/ui'

export function TodosPage() {
  const navigate = useNavigate()
  const { data: todos, isLoading, isError } = useTodos()
  const createTodo = useCreateTodo()
  const toggleTodo = useToggleTodo()
  const deleteTodo = useDeleteTodo()

  const { searchQuery, filterStatus, setSearchQuery, setFilterStatus } = useTodosUiStore()
  const [newTitle, setNewTitle] = useState('')

  if (isLoading) return <p>Loading...</p>
  if (isError) return <p>Something went wrong loading todos.</p>

  let visible = sortByNewest(todos ?? [])

  if (filterStatus === 'active') visible = visible.filter((t) => !t.completed)
  if (filterStatus === 'completed') visible = visible.filter((t) => t.completed)
  if (searchQuery.trim()) {
    visible = visible.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
  }

  const handleAdd = () => {
    if (!newTitle.trim()) return
    createTodo.mutate({ title: newTitle.trim() }, { onSuccess: () => setNewTitle('') })
  }

  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="mb-4 text-xl font-bold text-foreground">Todos</h1>

      <div className="mb-4 flex gap-2">
        <Input
          placeholder="New todo title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button onClick={handleAdd} isLoading={createTodo.isPending}>
          Add
        </Button>
      </div>

      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Search todos"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'completed')}
          className="rounded-md border border-border bg-background px-3 text-sm text-foreground"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <TodoList
        todos={visible}
        onToggle={(id) => toggleTodo.mutate(id)}
        onDelete={(id) => deleteTodo.mutate(id)}
        onOpen={(id) => navigate({ to: '/todos/$id', params: { id } })}
      />
    </div>
  )
}
