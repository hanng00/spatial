/**
 * Layer composition hook
 * Composes registered layers into deck.gl Layer array
 * Integrates with TanStack Query for data fetching
 */

'use client'

import { useMemo } from 'react'
import type { Layer } from '@deck.gl/core'
import type { LayerRegistryEntry } from './types'
import type { LayerClickEvent, LayerHoverEvent, LayerTooltip } from '../base/types'

interface UseLayerCompositionOptions {
  entries: LayerRegistryEntry[]
  dataMap: Map<string, unknown[]>
  onLayerClick?: (event: LayerClickEvent) => void
  onLayerHover?: (event: LayerHoverEvent) => void
}

/**
 * Composes layers from registry entries with their data
 */
export function useLayerComposition({
  entries,
  dataMap,
  onLayerClick,
  onLayerHover,
}: UseLayerCompositionOptions): Layer[] {
  return useMemo(() => {
    const layers: Layer[] = []

    for (const entry of entries) {
      // Skip disabled layers
      if (!entry.enabled || entry.config.visible === false) {
        continue
      }

      // Get data for this layer
      const data = dataMap.get(entry.definition.metadata.id) || []

      // Create layer instance with wrapped event handlers
      const baseLayer = entry.definition.factory(entry.config, data)

      if (baseLayer) {
        // Wrap event handlers to call both layer-specific and global handlers
        // We need to clone the layer with new props
        const originalOnClick = baseLayer.props.onClick
        const originalOnHover = baseLayer.props.onHover

        // Create new layer instance with wrapped handlers
        // Using the same layer class but with modified props
        const wrappedLayer = baseLayer.clone({
          onClick: originalOnClick
            ? (info: any) => {
                // Call original handler first
                originalOnClick(info)
                // Then call layer-specific handler
                if (entry.definition.onClick && info.object) {
                  entry.definition.onClick({
                    object: info.object,
                    layerId: entry.definition.metadata.id,
                    coordinate: info.coordinate,
                    nativeEvent: info.nativeEvent,
                  })
                }
                // Finally call global handler
                if (onLayerClick && info.object) {
                  onLayerClick({
                    object: info.object,
                    layerId: entry.definition.metadata.id,
                    coordinate: info.coordinate,
                    nativeEvent: info.nativeEvent,
                  })
                }
              }
            : entry.definition.onClick || onLayerClick
              ? (info: any) => {
                  if (entry.definition.onClick && info.object) {
                    entry.definition.onClick({
                      object: info.object,
                      layerId: entry.definition.metadata.id,
                      coordinate: info.coordinate,
                      nativeEvent: info.nativeEvent,
                    })
                  }
                  if (onLayerClick && info.object) {
                    onLayerClick({
                      object: info.object,
                      layerId: entry.definition.metadata.id,
                      coordinate: info.coordinate,
                      nativeEvent: info.nativeEvent,
                    })
                  }
                }
              : undefined,
          onHover: originalOnHover
            ? (info: any) => {
                originalOnHover(info)
                if (entry.definition.onHover) {
                  entry.definition.onHover({
                    object: info.object,
                    layerId: entry.definition.metadata.id,
                    coordinate: info.coordinate,
                  })
                }
                if (onLayerHover) {
                  onLayerHover({
                    object: info.object,
                    layerId: entry.definition.metadata.id,
                    coordinate: info.coordinate,
                  })
                }
              }
            : entry.definition.onHover || onLayerHover
              ? (info: any) => {
                  if (entry.definition.onHover) {
                    entry.definition.onHover({
                      object: info.object,
                      layerId: entry.definition.metadata.id,
                      coordinate: info.coordinate,
                    })
                  }
                  if (onLayerHover) {
                    onLayerHover({
                      object: info.object,
                      layerId: entry.definition.metadata.id,
                      coordinate: info.coordinate,
                    })
                  }
                }
              : undefined,
        })

        layers.push(wrappedLayer)
      }
    }

    return layers
  }, [entries, dataMap, onLayerClick, onLayerHover])
}

/**
 * Get tooltip for a layer object
 */
export function getLayerTooltip(
  entries: LayerRegistryEntry[],
  layerId: string,
  object: unknown
): LayerTooltip | null {
  const entry = entries.find((e) => e.definition.metadata.id === layerId)
  if (!entry || !entry.definition.getTooltip) {
    return null
  }

  return entry.definition.getTooltip(object as any)
}

