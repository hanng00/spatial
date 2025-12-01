'use client'

import { useMemo } from 'react'
import type { Layer } from '@deck.gl/core'

/**
 * Hook to compose multiple map layers into a single array
 * Filters out null/undefined layers for clean composition
 */
export function useMapLayerComposition(layers: (Layer | null | undefined)[]): Layer[] {
  return useMemo(() => {
    return layers.filter((layer): layer is Layer => layer !== null && layer !== undefined)
  }, [layers])
}

