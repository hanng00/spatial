/**
 * Adapter for DocumentGeography API data
 * Transforms API-specific data to layer-agnostic format
 */

import type { LayerDataPoint } from '../../layers/base/types'
import { getDistrictCoordinates } from '../../lib/electoralDistricts'
import type { DocumentGeographyData } from '../../lib/mapData'
import type { DataAdapter } from './types'

/**
 * Document geography layer data point
 * Extends base LayerDataPoint with geography-specific fields
 */
export interface DocumentGeographyPoint extends LayerDataPoint {
  count: number
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

/**
 * Adapter function: DocumentGeographyData[] → DocumentGeographyPoint[]
 */
export const documentGeographyAdapter: DataAdapter<
  DocumentGeographyData,
  DocumentGeographyPoint
> = (rawData) => {
  return rawData.map((item) => ({
    position: getDistrictCoordinates(item.electoral_district),
    name: item.electoral_district,
    type: 'electoral_district',
    count: item.document_count,
    electoral_district: item.electoral_district,
    document_year: item.document_year,
    document_month: item.document_month,
    politician_count: item.politician_count,
    party_count: item.party_count,
    question_count: item.question_count,
    proposition_count: item.proposition_count,
    report_count: item.report_count,
    motion_count: item.motion_count,
  }))
}

/**
 * Query adapter with TanStack Query integration
 */
export const documentGeographyQueryAdapter = {
  adapt: documentGeographyAdapter,
  getQueryKey: (params?: { year?: number; month?: number }) => {
    return ['documentGeography', params?.year, params?.month]
  },
}

