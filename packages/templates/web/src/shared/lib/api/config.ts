import { env } from '../../config/env'
import type { ApiError } from './ApiError'

export interface PreparedRequest {
  url: string
  method: string
  headers: Record<string, string>
  body?: unknown
  credentials?: RequestCredentials
}

export interface ApiConfig {
  baseUrl: string
  prepareRequest: (request: PreparedRequest) => PreparedRequest | Promise<PreparedRequest>
  unwrapResponse: (json: unknown, response: Response) => unknown
  extractError: (json: unknown, response: Response) => string | undefined
  onUnauthorized: (error: ApiError) => void
  onForbidden: (error: ApiError) => void
}

function createDefaults(): ApiConfig {
  return {
    baseUrl: env.API_ADDRESS,
    prepareRequest: (request) => request,
    unwrapResponse: (json) => json,
    extractError: (json) => {
      if (typeof json === 'object' && json !== null && 'message' in json) {
        return typeof json.message === 'string' ? json.message : undefined
      }
      return undefined
    },
    onUnauthorized: () => {},
    onForbidden: () => {},
  }
}

let config: ApiConfig = createDefaults()

export function configureApi(overrides: Partial<ApiConfig>): void {
  config = { ...config, ...overrides }
}

export function resetApiConfig(): void {
  config = createDefaults()
}

export function getApiConfig(): ApiConfig {
  return config
}
