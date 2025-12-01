/**
 * Layer registry types
 * Manages registration and composition of map layers
 */

import type { Layer } from '@deck.gl/core'
import type {
  BaseLayerConfig,
  LayerDefinition,
  LayerClickEvent,
  LayerHoverEvent,
  LayerTooltip,
} from '../base/types'

/**
 * Registry entry for a layer
 */
export interface LayerRegistryEntry<TConfig extends BaseLayerConfig = BaseLayerConfig> {
  definition: LayerDefinition<TConfig>
  config: TConfig
  enabled: boolean
}

/**
 * Registry interface
 */
export interface LayerRegistry {
  /** Register a layer */
  register<TConfig extends BaseLayerConfig>(
    definition: LayerDefinition<TConfig>,
    config: TConfig
  ): void
  /** Unregister a layer */
  unregister(layerId: string): void
  /** Get all registered layers */
  getEntries(): LayerRegistryEntry[]
  /** Get a specific layer entry */
  getEntry(layerId: string): LayerRegistryEntry | undefined
  /** Update layer config */
  updateConfig<TConfig extends BaseLayerConfig>(
    layerId: string,
    updates: Partial<TConfig>
  ): void
  /** Enable/disable a layer */
  setEnabled(layerId: string, enabled: boolean): void
}

