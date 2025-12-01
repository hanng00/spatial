/**
 * Data adapter types
 * Adapters transform API-specific data into layer-agnostic format
 */

import type { LayerDataPoint } from '../layers/base/types'

/**
 * Adapter function that transforms raw API data to layer data points
 */
export type DataAdapter<TRaw, TData extends LayerDataPoint = LayerDataPoint> = (
  rawData: TRaw[]
) => TData[]

/**
 * Adapter with query key generation for TanStack Query
 */
export interface QueryAdapter<TRaw, TData extends LayerDataPoint = LayerDataPoint> {
  /** Transform raw data to layer data points */
  adapt: DataAdapter<TRaw, TData>
  /** Generate query key for TanStack Query */
  getQueryKey: (params?: Record<string, unknown>) => unknown[]
}

