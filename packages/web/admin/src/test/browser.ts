import { setupWorker } from 'msw/browser'
import { todosHandlers } from '@/features/todos/api/todosApi.handlers'
export const worker = setupWorker(...todosHandlers)
