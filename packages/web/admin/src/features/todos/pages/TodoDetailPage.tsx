import { useNavigate, useParams } from '@tanstack/react-router'
import { useTodo } from '../hooks/useTodo'
import { Badge, Button, Card } from '@/shared/ui'

export function TodoDetailPage() {
  const { id } = useParams({ from: '/todos/$id' })
  const navigate = useNavigate()
  const { data: todo, isLoading, isError } = useTodo(id)

  if (isLoading) return <p className="p-4">Loading...</p>
  if (isError || !todo) return <p className="p-4">Todo not found.</p>

  return (
    <div className="mx-auto max-w-md p-4">
      <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate({ to: '/todos' })}>
        Back to list
      </Button>
      <Card
        title={todo.title}
        footer={
          <span className="text-sm text-muted-foreground">
            Updated {new Date(todo.updatedAt).toLocaleString()}
          </span>
        }
      >
        <div className="flex flex-col gap-3">
          <div>
            <Badge variant={todo.completed ? 'success' : 'warning'}>
              {todo.completed ? 'Completed' : 'Active'}
            </Badge>
          </div>
          <p className="text-sm text-foreground">{todo.description || 'No description.'}</p>
          <p className="text-sm text-muted-foreground">
            Created {new Date(todo.createdAt).toLocaleString()}
          </p>
        </div>
      </Card>
    </div>
  )
}
