/**
 * API functions for document geography data
 */

import type { DocumentGeographyData } from './mapData'

export interface DocumentGeographyApiResponse {
  data: DocumentGeographyData[]
  filters: {
    year: string
    month: string | null
  }
}

export interface FetchDocumentGeographyParams {
  year?: number
  month?: number
}

/**
 * Fetch document geography data from API
 */
export async function fetchDocumentGeography(
  params: FetchDocumentGeographyParams = {}
): Promise<DocumentGeographyData[]> {
  const { year, month } = params

  const searchParams = new URLSearchParams()
  if (year) searchParams.set('year', year.toString())
  if (month) searchParams.set('month', month.toString())

  const response = await fetch(`/api/map/documents?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to fetch document geography data')
  }

  const result: DocumentGeographyApiResponse = await response.json()
  return result.data || []
}

