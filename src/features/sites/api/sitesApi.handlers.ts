import { http, HttpResponse } from 'msw'
import type { SiteDetail, SiteSummary } from '../types'

type MockSite = Omit<SiteDetail, 'lastSeenAt'> & { lastSeenMinutesAgo: number }

// Fictional sites. Summaries are derived from these, so the two mock
// responses cannot drift apart.
const mockSites: MockSite[] = [
  {
    id: 'site-001',
    name: 'Benoni Logistics Park',
    label: 'Benoni',
    region: 'Gauteng',
    lat: -26.1885,
    lng: 28.3207,
    status: 'online',
    client: 'Eastgate Holdings',
    capacityKwp: 1250,
    inverterCount: 10,
    commissionedOn: '2023-04-18',
    lastSeenMinutesAgo: 0,
  },
  {
    id: 'site-002',
    name: 'Midrand Office Campus',
    label: 'Midrand',
    region: 'Gauteng',
    lat: -25.9992,
    lng: 28.1263,
    status: 'online',
    client: 'Northpoint Properties',
    capacityKwp: 640,
    inverterCount: 6,
    commissionedOn: '2022-11-02',
    lastSeenMinutesAgo: 0,
  },
  {
    id: 'site-003',
    name: 'Polokwane Cold Storage',
    label: 'Polokwane',
    region: 'Limpopo',
    lat: -23.9045,
    lng: 29.4689,
    status: 'maintenance',
    client: 'Limpopo Fresh',
    capacityKwp: 980,
    inverterCount: 8,
    commissionedOn: '2021-08-23',
    lastSeenMinutesAgo: 12,
  },
  {
    id: 'site-004',
    name: 'Durban Harbour Warehouse',
    label: 'Durban',
    region: 'KwaZulu-Natal',
    lat: -29.8711,
    lng: 31.0292,
    status: 'online',
    client: 'Coastal Freight',
    capacityKwp: 1820,
    inverterCount: 14,
    commissionedOn: '2024-02-12',
    lastSeenMinutesAgo: 0,
  },
  {
    id: 'site-005',
    name: 'Upington Agri Hub',
    label: 'Upington',
    region: 'Northern Cape',
    lat: -28.4478,
    lng: 21.2561,
    status: 'offline',
    client: 'Kalahari Growers',
    capacityKwp: 2400,
    inverterCount: 18,
    commissionedOn: '2020-06-30',
    lastSeenMinutesAgo: 180,
  },
  {
    id: 'site-006',
    name: 'Stellenbosch Winery',
    label: 'Stellenbosch',
    region: 'Western Cape',
    lat: -33.9321,
    lng: 18.8602,
    status: 'online',
    client: 'Helderberg Estates',
    capacityKwp: 450,
    inverterCount: 4,
    commissionedOn: '2023-09-07',
    lastSeenMinutesAgo: 0,
  },
]

/** Worked out per request, so "12 min ago" stays true however long dev runs. */
const toDetail = ({ lastSeenMinutesAgo, ...site }: MockSite): SiteDetail => ({
  ...site,
  lastSeenAt: new Date(Date.now() - lastSeenMinutesAgo * 60_000).toISOString(),
})

const toSummary = (site: MockSite): SiteSummary => {
  const { id, name, label, region, lastSeenAt, lat, lng, status } = toDetail(site)
  return { id, name, label, region, lastSeenAt, lat, lng, status }
}

const BASE_URL = 'http://localhost:3000/api/sites'

export const sitesHandlers = [
  http.post(`${BASE_URL}/getAll`, () => {
    return HttpResponse.json(mockSites.map(toSummary))
  }),
  http.post(`${BASE_URL}/getById`, async ({ request }) => {
    const { id } = (await request.json()) as { id?: string }
    const site = mockSites.find((s) => s.id === id)
    if (!site) {
      return HttpResponse.json({ message: `Site ${id} not found.` }, { status: 404 })
    }
    return HttpResponse.json(toDetail(site))
  }),
  // plop:handler
]
