import { useSites } from '../hooks/useSites'
import { useSitesUiStore } from '../store/useSitesUiStore'
import { filterSites } from '../libs/filterSites'
import { countByStatus } from '../libs/countByStatus'
import { SitesMap } from '../components/SitesMap'
import { SitesPanel } from '../components/SitesPanel'
import { SitesMobileSearch } from '../components/SitesMobileSearch'
import { SitesCarousel } from '../components/SitesCarousel'
import type { SiteSummary } from '../types'

const NO_SITES: SiteSummary[] = []

/**
 * Full-bleed page: the map fills the space, panels float over it. Desktop
 * gets a side panel; mobile gets a top search bar and swipeable cards.
 */
export function SitesPage() {
  const { data, isLoading, isError } = useSites()
  const selectedSiteId = useSitesUiStore((s) => s.selectedSiteId)
  const selectSite = useSitesUiStore((s) => s.selectSite)
  const searchQuery = useSitesUiStore((s) => s.searchQuery)
  const setSearchQuery = useSitesUiStore((s) => s.setSearchQuery)
  const baseLayer = useSitesUiStore((s) => s.baseLayer)
  const setBaseLayer = useSitesUiStore((s) => s.setBaseLayer)

  const allSites = data ?? NO_SITES
  const visibleSites = filterSites(allSites, searchQuery)

  return (
    <div className="relative flex-1">
      <SitesMap
        sites={visibleSites}
        allSites={allSites}
        selectedId={selectedSiteId}
        onSelect={selectSite}
        baseLayer={baseLayer}
        onBaseLayerChange={setBaseLayer}
        className="absolute inset-0"
        mobileBottom={
          <SitesCarousel items={visibleSites} selectedId={selectedSiteId} onSelect={selectSite} />
        }
      />

      <SitesMobileSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        className="absolute inset-x-4 top-[calc(env(safe-area-inset-top,0px)+1rem)] z-10 md:hidden"
      />

      <SitesPanel
        items={visibleSites}
        counts={countByStatus(allSites)}
        selectedId={selectedSiteId}
        onSelect={selectSite}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isLoading={isLoading}
        isError={isError}
        className="absolute bottom-5 left-5 top-20 z-10 hidden w-[22.5rem] md:flex"
      />
    </div>
  )
}
