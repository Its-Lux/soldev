/**
 * ISO 8601 date-time string, for example "2026-11-02T08:00:00.000Z".
 * Dates never cross the API as Date objects, because JSON has no date type.
 */
export type IsoDateString = string

/** Body for actions that target one record. */
export interface IdRequest {
  id: string
}
