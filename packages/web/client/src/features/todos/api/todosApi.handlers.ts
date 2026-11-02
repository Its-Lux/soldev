import { http, HttpResponse } from 'msw'
import type { CreateTodoInput, Todo, TodoDetail } from '../types'

let records: TodoDetail[] = [
  {
    id: '1',
    title: 'Learn MSW',
    completed: false,
    createdAt: '2024-01-01T00:00:00Z',
    description: 'Read the MSW docs and mock the first endpoint.',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Ship the feature',
    completed: true,
    createdAt: '2024-01-02T00:00:00Z',
    description: 'Release the todos feature to the staging environment.',
    updatedAt: '2024-01-03T00:00:00Z',
  },
]

const BASE_URL = 'http://localhost:3000/api/todos'

// The list route returns only what a list needs. The detail route returns the
// whole record, so the list-then-detail split is visible in the network tab.
const toSummary = ({ id, title, completed, createdAt }: TodoDetail): Todo => ({
  id,
  title,
  completed,
  createdAt,
})

const readId = async (request: Request): Promise<string | undefined> => {
  const body = (await request.json()) as { id?: string }
  return body.id
}

export const todosHandlers = [
  http.post(`${BASE_URL}/getAll`, () => {
    return HttpResponse.json(records.map(toSummary))
  }),

  http.post(`${BASE_URL}/getById`, async ({ request }) => {
    const id = await readId(request)
    const record = records.find((r) => r.id === id)
    if (!record) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(record)
  }),

  http.post(`${BASE_URL}/create`, async ({ request }) => {
    const body = (await request.json()) as CreateTodoInput
    const now = new Date().toISOString()
    const record: TodoDetail = {
      id: crypto.randomUUID(),
      title: body.title,
      completed: false,
      createdAt: now,
      description: '',
      updatedAt: now,
    }
    records = [...records, record]
    return HttpResponse.json(toSummary(record), { status: 201 })
  }),

  http.post(`${BASE_URL}/toggle`, async ({ request }) => {
    const id = await readId(request)
    const record = records.find((r) => r.id === id)
    if (!record) return new HttpResponse(null, { status: 404 })
    record.completed = !record.completed
    record.updatedAt = new Date().toISOString()
    return HttpResponse.json(toSummary(record))
  }),

  http.post(`${BASE_URL}/delete`, async ({ request }) => {
    const id = await readId(request)
    records = records.filter((r) => r.id !== id)
    return new HttpResponse(null, { status: 204 })
  }),
]
