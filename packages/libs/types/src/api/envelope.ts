/**
 * Status block on every response from a backend that wraps its payloads.
 */
export interface ApiStatus {
  success: boolean
  message: string
}

/**
 * Envelope used by backends that wrap payloads, with the payload under a key
 * named for the route, for example { status, todos: [...] }.
 * Features never see this: request()'s unwrapResponse removes it.
 */
export type ApiResponse<TKey extends string, TPayload> = { status: ApiStatus } & {
  [K in TKey]: TPayload
}

/** Error envelope: no payload key, and success is always false. */
export interface ApiErrorResponse {
  status: ApiStatus & { success: false }
}

/** Body for actions that take no parameters (the client always sends {}). */
export type EmptyRequest = Record<string, never>
