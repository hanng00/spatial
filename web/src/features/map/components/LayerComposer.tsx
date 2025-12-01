/**
 * Layer Composer Component
 * Composes registered layers with their data and handles interactions
 */

'use client'

import { useMemo } from 'react'
import type { Layer } from '@deck.gl/core'
import { useLayerRegistryStore } from '../stores/layerRegistryStore'
import { useLayerComposition, getLayerTooltip } from '../layers/registry/useLayerComposition'
import type { LayerClickEvent, LayerHoverEvent, LayerTooltip } from '../layers/base/types'

interface LayerComposerProps {
  /** Map of layer IDs to their data arrays */
  dataMap: Map<string, unknown[]>
  /** Global click handler */
  onLayerClick?: (event: LayerClickEvent) => void
  /** Global hover handler */
  onLayerHover?: (event: LayerHoverEvent) => void
  /** Children render function that receives composed layers */
  children: (props: {
    layers: Layer[]
    getTooltip: (layerId: string, object: unknown) => LayerTooltip | null
  }) => React.ReactNode
}

/**
 * Composes layers from registry with their data
 */
export function LayerComposer({
  dataMap,
  onLayerClick,
  onLayerHover,
  children,
}: LayerComposerProps) {
  // Select the entries Map directly to avoid infinite loops
  // The Map reference is stable unless entries actually change
  const entriesMap = useLayerRegistryStore((state) => state.entries)
  
  // Convert Map to array only when entries Map changes
  const entries = useMemo(
    () => Array.from(entriesMap.values()),
    [entriesMap]
  )

  const layers = useLayerComposition({
    entries,
    dataMap,
    onLayerClick,
    onLayerHover,
  })

  const getTooltip = useMemo(
    () => (layerId: string, object: unknown) => {
      return getLayerTooltip(entries, layerId, object)
    },
    [entries]
  )

  return <>{children({ layers, getTooltip })}</>
}

