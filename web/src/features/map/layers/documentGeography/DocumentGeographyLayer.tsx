/**
 * DocumentGeography Layer
 * Isolated layer implementation using the new architecture
 */

'use client'

import type { Layer } from '@deck.gl/core'
import { ScatterplotLayer } from 'deck.gl'
import type { DocumentGeographyPoint } from '../../data/adapters/documentGeographyAdapter'
import type {
  BaseLayerConfig,
  LayerDefinition,
  LayerTooltip
} from '../base/types'

/**
 * DocumentGeography layer-specific configuration
 */
export interface DocumentGeographyLayerConfig extends BaseLayerConfig {
  radiusMinPixels?: number
  radiusMaxPixels?: number
  highlightColor?: [number, number, number, number]
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
function calculateColor(
  count: number,
  maxCount: number
): [number, number, number, number] {
  const intensity = Math.min(1, count / maxCount)
  // Blue to red gradient: low = blue, high = red
  const r = Math.floor(intensity * 200 + 55)
  const g = Math.floor((1 - intensity) * 100 + 55)
  const b = Math.floor((1 - intensity) * 200 + 55)
  return [r, g, b, 200]
}

/**
 * Layer factory function
 */
function createDocumentGeographyLayer(
  config: DocumentGeographyLayerConfig,
  data: DocumentGeographyPoint[]
): Layer | null {
  if (!data || data.length === 0) return null

  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return new ScatterplotLayer({
    id: config.id,
    data,
    getPosition: (d: DocumentGeographyPoint) => d.position,
    getRadius: (d: DocumentGeographyPoint) => calculateRadius(d.count),
    getFillColor: (d: DocumentGeographyPoint) => calculateColor(d.count, maxCount),
    radiusMinPixels: config.radiusMinPixels ?? 8,
    radiusMaxPixels: config.radiusMaxPixels ?? 150,
    radiusUnits: 'pixels',
    pickable: true,
    autoHighlight: true,
    highlightColor: config.highlightColor ?? [255, 255, 0, 200],
    opacity: config.opacity ?? 1,
    visible: config.visible !== false,
  })
}

/**
 * Tooltip provider for document geography layer
 */
function getDocumentGeographyTooltip(
  object: DocumentGeographyPoint | null
): LayerTooltip | null {
  if (!object) return null

  const {
    name,
    count,
    politician_count,
    party_count,
    question_count,
    proposition_count,
    report_count,
    motion_count,
  } = object

  return {
    html: `<div style="padding: 12px; background: white; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-family: system-ui; min-width: 200px;">
      <strong style="font-size: 14px; color: #1c1c1c; display: block; margin-bottom: 8px;">${name}</strong>
      <div style="border-top: 1px solid #e5e5e5; padding-top: 8px; margin-top: 8px;">
        <div style="font-size: 16px; font-weight: 600; color: #1c1c1c; margin-bottom: 4px;">${count} documents</div>
        <div style="font-size: 11px; color: #6b6b6b; margin-top: 8px;">
          <div>${politician_count} politicians • ${party_count} parties</div>
          <div style="margin-top: 4px;">
            ${question_count} questions • ${proposition_count} propositions<br/>
            ${report_count} reports • ${motion_count} motions
          </div>
        </div>
      </div>
    </div>`,
    style: {
      backgroundColor: 'transparent',
    } as Partial<CSSStyleDeclaration>,
  }
}

/**
 * DocumentGeography layer definition
 */
export const documentGeographyLayerDefinition: LayerDefinition<
  DocumentGeographyLayerConfig,
  DocumentGeographyPoint
> = {
  metadata: {
    id: 'document-geography-layer',
    name: 'Document Geography',
    description: 'Shows document counts by electoral district',
    supportsTooltip: true,
    supportsInteractions: true,
  },
  factory: createDocumentGeographyLayer,
  getTooltip: getDocumentGeographyTooltip,
}

