'use client'

import { useMemo } from 'react'
import { ScatterplotLayer } from 'deck.gl'
import type { Layer } from '@deck.gl/core'
import type { MapDocumentPoint } from '../lib/mapData'

interface UseMapLayersOptions {
  data?: MapDocumentPoint[]
  onPointClick?: (point: MapDocumentPoint) => void
}

/**
 * Calculate radius based on document count
 * Scales logarithmically for better visualization
 */
function calculateRadius(count: number): number {
  return Math.max(8, Math.min(100, Math.sqrt(count) * 3))
}

/**
 * Calculate color intensity based on document count
 * Returns RGB array [r, g, b, alpha]
 */
function calculateColor(count: number, maxCount: number): [number, number, number, number] {
  const intensity = Math.min(1, count / maxCount)
  // Blue to red gradient: low = blue, high = red
  const r = Math.floor(intensity * 200 + 55)
  const g = Math.floor((1 - intensity) * 100 + 55)
  const b = Math.floor((1 - intensity) * 200 + 55)
  return [r, g, b, 200]
}

export function useMapLayers({
  data = [],
  onPointClick,
}: UseMapLayersOptions = {}): Layer[] {
  const maxCount = useMemo(() => {
    if (!data || data.length === 0) return 1
    return Math.max(...data.map((d) => d.count))
  }, [data])

  return useMemo(
    () => [
      new ScatterplotLayer({
        id: 'document-geography-layer',
        data,
        getPosition: (d: MapDocumentPoint) => d.position,
        getRadius: (d: MapDocumentPoint) => calculateRadius(d.count),
        getFillColor: (d: MapDocumentPoint) => calculateColor(d.count, maxCount),
        radiusMinPixels: 8,
        radiusMaxPixels: 150,
        radiusUnits: 'pixels',
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 0, 200],
        onClick: (info) => {
          if (info.object && onPointClick) {
            onPointClick(info.object as MapDocumentPoint)
          }
        },
      }),
    ],
    [data, maxCount, onPointClick]
  )
}

