/**
 * Core layer types and interfaces
 * Defines the contract that all map layers must follow
 */

import type { Layer } from '@deck.gl/core'

/**
 * Generic data point interface that all layers can work with
 * Layers can extend this with their own specific fields
 */
export interface LayerDataPoint {
  /** Geographic position [longitude, latitude] */
  position: [number, number]
  /** Display name/label */
  name: string
  /** Layer-specific data */
  [key: string]: unknown
}

/**
 * Tooltip data structure
 * Compatible with deck.gl TooltipContent format
 */
export interface LayerTooltip {
  html?: string
  text?: string
  className?: string
  style?: Partial<CSSStyleDeclaration>
}

/**
 * Layer interaction events
 */
export interface LayerClickEvent<T extends LayerDataPoint = LayerDataPoint> {
  object: T | null
  layerId: string
  coordinate: [number, number]
  nativeEvent: MouseEvent
}

export interface LayerHoverEvent<T extends LayerDataPoint = LayerDataPoint> {
  object: T | null
  layerId: string
  coordinate: [number, number]
}

/**
 * Base configuration that all layers share
 */
export interface BaseLayerConfig {
  /** Unique identifier for the layer */
  id: string
  /** Whether the layer is enabled */
  enabled?: boolean
  /** Layer opacity (0-1) */
  opacity?: number
  /** Visibility toggle */
  visible?: boolean
}

/**
 * Layer factory function type
 * Creates a layer instance given config and data
 */
export type LayerFactory<TConfig extends BaseLayerConfig = BaseLayerConfig, TData extends LayerDataPoint = LayerDataPoint> = (
  config: TConfig,
  data: TData[]
) => Layer | null

/**
 * Layer metadata and capabilities
 */
export interface LayerMetadata {
  /** Unique layer identifier */
  id: string
  /** Human-readable name */
  name: string
  /** Layer description */
  description?: string
  /** Whether layer supports tooltips */
  supportsTooltip?: boolean
  /** Whether layer supports interactions */
  supportsInteractions?: boolean
}

/**
 * Complete layer definition
 */
export interface LayerDefinition<
  TConfig extends BaseLayerConfig = BaseLayerConfig,
  TData extends LayerDataPoint = LayerDataPoint
> {
  metadata: LayerMetadata
  factory: LayerFactory<TConfig, TData>
  /** Optional tooltip provider */
  getTooltip?: (object: TData | null) => LayerTooltip | null
  /** Optional click handler */
  onClick?: (event: LayerClickEvent<TData>) => void
  /** Optional hover handler */
  onHover?: (event: LayerHoverEvent<TData>) => void
}

