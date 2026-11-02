interface ApiErrorInit {
  status: number
  message: string
  body?: unknown
  cause?: unknown
}

/**
 * Thrown by request() for anything that went wrong talking to the server.
 * status is the HTTP status, or 0 when the network call itself failed.
 * body is whatever the server sent back, parsed as JSON where possible.
 */
export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor({ status, message, body, cause }: ApiErrorInit) {
    super(message, cause === undefined ? undefined : { cause })
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}
