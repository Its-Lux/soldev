import { configureApi } from '@/shared/lib'

/**
 * The one place this project adapts the API client to its backend. It is
 * called once at startup, before anything renders.
 *
 * Every hook below is optional. With none of them set, the client expects
 * bare JSON and sends no credentials, which is what the mock handlers return.
 *
 * - prepareRequest: add a token to a header or body, or set credentials
 * - unwrapResponse: read data out of an envelope, or throw an ApiError for a
 *   failure the server reports inside a 2xx response
 * - extractError: read a message from an error response body
 * - onUnauthorized and onForbidden: react to a 401 or 403 in one place
 *
 * A complete worked example is in docs/examples/existing-system-adapter.ts.
 */
export function setupApi(): void {
  configureApi({
    // prepareRequest: (request) => request,
    // unwrapResponse: (json) => json,
    // extractError: () => undefined,
    // onUnauthorized: () => {},
    // onForbidden: () => {},
  })
}
