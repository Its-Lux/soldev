/// <reference types="google.maps" />
import type { MapProps } from '@vis.gl/react-google-maps'

/**
 * How a preset gets its look.
 *
 * - 'cloud': styled in Google Cloud Console via a Map ID. Supports Advanced
 *   Markers. Light/dark comes from the Map ID's own variants (colorScheme).
 * - 'code': styled with JSON in this repo. Google ignores JSON styles when a
 *   Map ID is set, so this kind never has one, and only legacy markers work.
 */
export type MapKind = 'cloud' | 'code'

/** Behaviour options a preset may set. Appearance keys are excluded on purpose. */
export type MapBehaviour = Omit<
  MapProps,
  'mapId' | 'styles' | 'colorScheme' | 'renderingType' | 'children' | 'style' | 'className'
>

type PresetBase = {
  /** Default map options for this look (controls, gestures, map type). */
  behaviour?: MapBehaviour
}

export type CloudMapPreset = PresetBase & {
  kind: 'cloud'
  /** Map ID from Google Cloud Console. Omit to use the env default. */
  mapId?: string
  styles?: never
  darkStyles?: never
}

export type CodeMapPreset = PresetBase & {
  kind: 'code'
  styles: google.maps.MapTypeStyle[]
  /** Used when the app theme is dark. Falls back to `styles`. */
  darkStyles?: google.maps.MapTypeStyle[]
  mapId?: never
}

/** A preset is one kind or the other, never both. */
export type MapPreset = CloudMapPreset | CodeMapPreset

export type MapVariant = 'default' | 'satellite' | 'minimal' | 'clean' | 'preview'

export type AppTheme = 'light' | 'dark'
