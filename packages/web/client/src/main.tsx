import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { setupApi } from '@/app/api/setupApi'
import { ErrorBoundary } from '@/app/providers/ErrorBoundary'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { ThemeProvider } from '@/shared/lib'
import { router } from '@/app/router/router'
import './index.css'

// Adapt the API client to this project's backend before any request can run.
setupApi()

async function enableMocking() {
  if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    const { worker } = await import('@/test/browser')
    return worker.start({ onUnhandledRequest: 'warn' })
  }
}

enableMocking()
  .catch((error) => console.error('Could not start the mock layer', error))
  .then(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <ErrorBoundary>
          <ThemeProvider>
            <QueryProvider>
              <RouterProvider router={router} />
            </QueryProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </StrictMode>,
    )
  })
