/**
 * Map data types and utilities
 */

export interface MapDataPoint {
  position: [number, number]
  name: string
  type: string
  count: number
}

export interface DocumentGeographyData {
  electoral_district: string
  document_year: number
  document_month: number
  document_count: number
  politician_count: number
  party_count: number
  question_count: number
  proposition_count: number
  report_count: number
  motion_count: number
  committee_count?: number
  first_document_date?: string
  last_document_date?: string
}

export interface MapDocumentPoint extends MapDataPoint {
  electoral_district: string
  document_year: number
  document_month: number
  politician_count: number
  party_count: number
  question_count: number
  proposition_count: number
  report_count: number
  motion_count: number
}

export const SAMPLE_MAP_DATA: MapDataPoint[] = [
  { position: [18.0686, 59.3293], name: 'Stockholm', type: 'city', count: 150 },
  {
    position: [18.0719, 59.3326],
    name: 'Riksdagen',
    type: 'government',
    count: 89,
  },
  {
    position: [18.0632, 59.3346],
    name: 'Corporate Office',
    type: 'corporate',
    count: 42,
  },
]

/**
 * Convert DocumentGeographyData to MapDocumentPoint
 */
export function geographyToMapPoint(
  data: DocumentGeographyData,
  getCoordinates: (district: string) => [number, number]
): MapDocumentPoint {
  return {
    position: getCoordinates(data.electoral_district),
    name: data.electoral_district,
    type: 'electoral_district',
    count: data.document_count,
    electoral_district: data.electoral_district,
    document_year: data.document_year,
    document_month: data.document_month,
    politician_count: data.politician_count,
    party_count: data.party_count,
    question_count: data.question_count,
    proposition_count: data.proposition_count,
    report_count: data.report_count,
    motion_count: data.motion_count,
  }
}
