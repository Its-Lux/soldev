/**
 * EXAMPLE ONLY. This is not part of the template and nothing imports it.
 *
 * It shows how one real backend plugs into the API client. What the route
 * file and the Bruno requests for that backend show:
 * - every route is a POST named for its action, for example
 *   /analyticsDashboard/getIrradiance
 * - bodies are flat JSON, with ids named for the resource (assetId, inverterId)
 * - most responses are { status: { success, message }, <PascalCaseKey>: payload },
 *   with a different key per route (IrradianceData, Inverters, and so on).
 *   One route, /dataimporter, uses a data key instead
 * - a failure can be reported with status.success set to false
 *
 * The token travels in the JSON body: the frontend's withToken helper appends
 * a token variable to every request body, which the owner confirmed. The Bruno
 * requests show no token because their auth is inherited from the collection,
 * which was not provided, so this adapter follows the frontend.
 *
 * Another project would write its own version of this file. This one is not
 * compiled by `yarn typecheck`, so check it still builds before relying on it.
 *
 * Wiring, in that project's src/app/api/setupApi.ts:
 *
 *   import { configureApi } from '@/shared/lib'
 *   import { createExistingSystemConfig } from './existingSystemAdapter'
 *
 *   export function setupApi(): void {
 *     configureApi(
 *       createExistingSystemConfig({
 *         getToken: () => sessionStore.getState().token,
 * *         onSessionExpired: () => sessionStore.getState().signOut(),
 *         onForbidden: () => showNoAccessMessage(),
 *       }),
 *     )
 *   }
 */
import { ApiError, type ApiConfig, type PreparedRequest } from '@/shared/lib'

interface ExistingSystemDeps {
  /** The current token, or null when signed out. */
  getToken: () => string | null
  /** The session is no longer valid, so send the person to sign in. */
  onSessionExpired: () => void
  /** The person is signed in but not allowed to do this. */
  onForbidden: () => void
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function createExistingSystemConfig(deps: ExistingSystemDeps): Partial<ApiConfig> {
  return {
    // Same job as the existing withToken helper. request() already sends every
    // call as a POST with at least an empty body, so a call with no parameters
    // still has a body to add the token to.
    prepareRequest: (request: PreparedRequest): PreparedRequest => {
      const token = deps.getToken()
      if (token === null || !isRecord(request.body)) return request
      return { ...request, body: { ...request.body, token } }
    },

    // A failure can arrive inside a 200, so check status.success first. A body
    // with a data key (the /dataimporter route) returns data. Every other
    // route has a named key instead, so the whole body is returned and the
    // caller's schema describes status plus that key.
    unwrapResponse: (json, response) => {
      if (!isRecord(json)) return json
      const status = isRecord(json.status) ? json.status : undefined
      if (status?.success === false) {
        throw new ApiError({
          status: response.status,
          message: typeof status.message === 'string' ? status.message : 'Request failed',
          body: json,
        })
      }
      return 'data' in json ? json.data : json
    },

    extractError: (json) => {
      if (!isRecord(json) || !isRecord(json.status)) return undefined
      return typeof json.status.message === 'string' ? json.status.message : undefined
    },

    onUnauthorized: () => deps.onSessionExpired(),
    onForbidden: () => deps.onForbidden(),
  }
}
