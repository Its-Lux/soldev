import { useMatches } from '@tanstack/react-router'

/** True when any route in the current match asks for a full-bleed page. */
export function useFullBleed(): boolean {
  return useMatches({ select: (matches) => matches.some((m) => m.staticData?.fullBleed === true) })
}
