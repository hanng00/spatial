'use client'

import { useQuery } from '@tanstack/react-query'
import type { MapDocumentPoint } from '../lib/mapData'
import { geographyToMapPoint } from '../lib/mapData'
import { getDistrictCoordinates } from '../lib/electoralDistricts'
import {
  fetchDocumentGeography,
  type FetchDocumentGeographyParams,
} from '../lib/documentGeographyApi'

interface UseDocumentGeographyOptions {
  year?: number
  month?: number
}

/**
 * Hook to fetch and transform document geography data using TanStack Query
 */
export function useDocumentGeography({
  year,
  month,
}: UseDocumentGeographyOptions = {}) {
  const queryParams: FetchDocumentGeographyParams = {}
  if (year) queryParams.year = year
  if (month) queryParams.month = month

  const {
    data: geographyData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['documentGeography', year, month],
    queryFn: () => fetchDocumentGeography(queryParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Transform geography data to map points
  const data: MapDocumentPoint[] =
    geographyData?.map((item) =>
      geographyToMapPoint(item, getDistrictCoordinates)
    ) || []

  return {
    data,
    loading: isLoading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    refetch: () => {
      refetch()
    },
  }
}
