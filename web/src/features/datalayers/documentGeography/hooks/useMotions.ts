/**
 * Hook for fetching motions by district
 * Uses TanStack Query for data fetching and caching
 */

import { useQuery } from '@tanstack/react-query'
import { fetchMotions, type FetchMotionsParams, type Motion } from '../lib/motionsApi'

interface UseMotionsOptions {
  district: string | null
  year?: number
  month?: number
  limit?: number
  enabled?: boolean
}

interface UseMotionsResult {
  data: Motion[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

export function useMotions({
  district,
  year,
  month,
  limit = 50,
  enabled = true,
}: UseMotionsOptions): UseMotionsResult {
  const params: FetchMotionsParams | null = district
    ? { district, year, month, limit }
    : null

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['motions', params?.district, params?.year, params?.month, params?.limit],
    queryFn: () => (params ? fetchMotions(params) : Promise.resolve([])),
    enabled: enabled && !!district,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    data: data || [],
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  }
}

