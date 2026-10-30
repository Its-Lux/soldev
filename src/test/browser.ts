import { setupWorker } from 'msw/browser'
import { todosHandlers } from '@/features/todos/api/todosApi.handlers'
import { sitesHandlers } from '@/features/sites/api/sitesApi.handlers'
export const worker = setupWorker(...todosHandlers, ...sitesHandlers)
