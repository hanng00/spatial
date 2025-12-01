/**
 * Data provider hook for document geography
 * Uses TanStack Query for fetching and caching
 * Uses adapter pattern for data transformation
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDocumentGeography } from "../../lib/documentGeographyApi";
import type { DocumentGeographyPoint } from "../adapters/documentGeographyAdapter";
import { documentGeographyQueryAdapter } from "../adapters/documentGeographyAdapter";

interface UseDocumentGeographyDataOptions {
  year?: number;
  month?: number;
  enabled?: boolean;
}

/**
 * Hook to fetch document geography data using TanStack Query
 * Returns normalized data ready for layer consumption
 */
export function useDocumentGeographyData({
  year,
  month,
  enabled = true,
}: UseDocumentGeographyDataOptions = {}) {
  const queryParams = { year, month };

  const {
    data: rawData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: documentGeographyQueryAdapter.getQueryKey(queryParams),
    queryFn: () => fetchDocumentGeography(queryParams),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Transform using adapter
  const data: DocumentGeographyPoint[] = rawData
    ? documentGeographyQueryAdapter.adapt(rawData)
    : [];

  return {
    data,
    loading: isLoading,
    error:
      error instanceof Error ? error.message : error ? String(error) : null,
    refetch,
  };
}
