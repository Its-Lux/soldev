import { create } from 'zustand'
import type { MapBaseLayer } from '@/shared/ui'

interface SitesUiState {
  searchQuery: string
  setSearchQuery: (query: string) => void
  /** The site highlighted on the map and expanded in the list. */
  selectedSiteId: string | null
  selectSite: (id: string | null) => void
  /** Map or satellite imagery. */
  baseLayer: MapBaseLayer
  setBaseLayer: (layer: MapBaseLayer) => void
}

export const useSitesUiStore = create<SitesUiState>((set) => ({
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  selectedSiteId: null,
  selectSite: (selectedSiteId) => set({ selectedSiteId }),
  baseLayer: 'map',
  setBaseLayer: (baseLayer) => set({ baseLayer }),
}))
