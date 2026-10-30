/**
 * EXAMPLE ONLY. Two of the existing system's request functions, rewritten on
 * the template's API client. Nothing imports this file.
 *
 * Before, each request function was about 25 lines: build the axios call, set
 * a JSON header, wrap the body with withToken, check status.success, and a
 * try/catch that only rethrows. Across the ten request functions in the files
 * provided that came to 247 lines. The adapter now owns the token, the
 * status.success check and the error messages, so each one shrinks to a call.
 *
 * Data shaping, such as transformIrradianceData, is not request plumbing. In
 * the template it moves into the feature's services/ folder as a pure function
 * that takes the typed response.
 *
 * The types below are compile-time only. Nothing checks at runtime that the
 * server sends these shapes, so keep them in step with the real API.
 */
import { request } from '@/shared/lib/'

interface ResponseStatus {
  success: boolean
  message?: string
}

export interface IrradianceReading {
  timestamp: string
  irradianceSensor: number
  irradianceSatellite: number
}

// Describes the whole body, because this route returns status plus a named key.
export interface IrradianceResponse {
  status: ResponseStatus
  IrradianceData: IrradianceReading[]
}

// The files provided do not show what each inverter looks like, so this is
// deliberately loose until the real shape is known. unknown forces a caller to
// check each item before using it, which any[] would not.
export interface InvertersResponse {
  status: ResponseStatus
  Inverters: unknown[]
}

export interface IrradianceRequest {
  assetId: string
  startDate: string
  endDate: string
  timePeriod: string
}

const route = (action: string) => `/analyticsDashboard/${action}`

export const irradianceApi = {
  getIrradianceData: (params: IrradianceRequest) =>
    request<IrradianceResponse>({ path: route('getIrradiance'), body: params }),
}

export const stringHeatmapApi = {
  getInverters: (assetId: string) =>
    request<InvertersResponse>({ path: route('getInverters'), body: { assetId } }),
}
