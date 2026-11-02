import { ApiError } from './ApiError'
import { getApiConfig, type PreparedRequest } from './config'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestOptions<T> {
  /** Path relative to the configured base URL, starting with a slash. */
  path: string
  method?: HttpMethod
  /** A plain value, sent as JSON. */
  body?: unknown
  /**
   * Optional runtime check. Receives the unwrapped payload and returns it as T,
   * or throws if it is not the expected shape. Leave it out to trust the type
   * argument. Any function with this signature works, including a validation
   * library's parse method, so a project can add one without changing request().
   */
  parse?: (data: unknown) => T
}

/**
 * The one way features talk to the network. It builds the URL, applies the
 * project's request preparation, parses the response and applies the project's
 * unwrapping.
 *
 * The type argument says what the server returns: request<Todo[]>({ ... }).
 * It is a compile-time promise, not a runtime check, unless parse is given.
 * Without a type argument or parse, the result is void.
 *
 * Every call is a POST with a JSON body unless a method is given, because the
 * APIs this template is built for use POST for reads as well as writes. A call
 * with no parameters sends an empty object, so there is always a body for a
 * project's prepareRequest to add to.
 *
 * Failures:
 * - ApiError with status 0: the server could not be reached
 * - ApiError with the HTTP status: the server answered with an error, or
 *   answered 2xx with a body that is not valid JSON
 * - Whatever parse throws, when a parse function is given
 */
export async function request<T = void>(options: RequestOptions<T>): Promise<T> {
  const config = getApiConfig()
  const { path, method = 'POST', parse } = options
  const body = options.body === undefined && method === 'POST' ? {} : options.body

  let prepared: PreparedRequest = {
    url: `${config.baseUrl}${path}`,
    method,
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body,
  }
  prepared = await config.prepareRequest(prepared)

  if ((prepared.method === 'GET' || prepared.method === 'HEAD') && prepared.body !== undefined) {
    throw new Error(
      `A ${prepared.method} request cannot have a body. Check prepareRequest in the API setup.`,
    )
  }

  let response: Response
  try {
    response = await fetch(prepared.url, {
      method: prepared.method,
      headers: prepared.headers,
      credentials: prepared.credentials,
      body: prepared.body === undefined ? undefined : JSON.stringify(prepared.body),
    })
  } catch (cause) {
    throw new ApiError({
      status: 0,
      message: 'Network error: the server could not be reached',
      cause,
    })
  }

  const text = await response.text()
  let json: unknown
  let invalidJson = false
  if (text !== '') {
    try {
      json = JSON.parse(text)
    } catch {
      invalidJson = true
    }
  }

  if (!response.ok) {
    const message =
      config.extractError(json, response) ??
      (response.statusText || `Request failed with status ${response.status}`)
    const error = new ApiError({
      status: response.status,
      message,
      body: invalidJson ? text : json,
    })
    if (response.status === 401) config.onUnauthorized(error)
    if (response.status === 403) config.onForbidden(error)
    throw error
  }

  if (invalidJson) {
    throw new ApiError({
      status: response.status,
      message: 'The server returned a response that is not valid JSON',
      body: text,
    })
  }

  const payload = config.unwrapResponse(json, response)
  if (parse !== undefined) return parse(payload)
  // Deliberate trust point: with no parse function, the caller's type argument
  // is taken at its word. This is the one cast in the client.
  return payload as T
}
