/**
 * Adapter for DocumentGeography API data
 * Transforms API-specific data to layer-agnostic format
 */

import type { LayerDataPoint } from '@/features/map/layers/base/types'
import { getDistrictCoordinates } from '../lib/electoralDistricts'
import type { DocumentGeographyData } from '../lib/mapData'
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
    count: Number(item.document_count) || 0,
    electoral_district: item.electoral_district,
    document_year: Number(item.document_year) || 0,
    document_month: Number(item.document_month) || 0,
    politician_count: Number(item.politician_count) || 0,
    party_count: Number(item.party_count) || 0,
    question_count: Number(item.question_count) || 0,
    proposition_count: Number(item.proposition_count) || 0,
    report_count: Number(item.report_count) || 0,
    motion_count: Number(item.motion_count) || 0,
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

