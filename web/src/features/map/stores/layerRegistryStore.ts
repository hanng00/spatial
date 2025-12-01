/**
 * Layer Registry Store
 * Manages layer registration and configuration using Zustand
 */

'use client'

import { create } from 'zustand'
import type {
  BaseLayerConfig,
  LayerDefinition,
} from '../layers/base/types'
import type { LayerRegistryEntry } from '../layers/registry/types'

interface LayerRegistryState {
  entries: Map<string, LayerRegistryEntry>
  register: <TConfig extends BaseLayerConfig>(
    definition: LayerDefinition<TConfig, any>,
    config: TConfig
  ) => void
  unregister: (layerId: string) => void
  getEntries: () => LayerRegistryEntry[]
  getEntry: (layerId: string) => LayerRegistryEntry | undefined
  updateConfig: <TConfig extends BaseLayerConfig>(
    layerId: string,
    updates: Partial<TConfig>
  ) => void
  setEnabled: (layerId: string, enabled: boolean) => void
}

export const useLayerRegistryStore = create<LayerRegistryState>((set, get) => ({
  entries: new Map(),

  register: <TConfig extends BaseLayerConfig>(
    definition: LayerDefinition<TConfig, any>,
    config: TConfig
  ) => {
    set((state) => {
      const newEntries = new Map(state.entries)
      newEntries.set(definition.metadata.id, {
        definition: definition as LayerDefinition<BaseLayerConfig, any>,
        config,
        enabled: config.enabled ?? true,
      })
      return { entries: newEntries }
    })
  },

  unregister: (layerId: string) => {
    set((state) => {
      const newEntries = new Map(state.entries)
      newEntries.delete(layerId)
      return { entries: newEntries }
    })
  },

  getEntries: () => {
    return Array.from(get().entries.values())
  },

  getEntry: (layerId: string) => {
    return get().entries.get(layerId)
  },

  updateConfig: <TConfig extends BaseLayerConfig>(
    layerId: string,
    updates: Partial<TConfig>
  ) => {
    set((state) => {
      const entry = state.entries.get(layerId)
      if (!entry) return state

      const newEntries = new Map(state.entries)
      newEntries.set(layerId, {
        ...entry,
        config: { ...entry.config, ...updates } as TConfig,
      })
      return { entries: newEntries }
    })
  },

  setEnabled: (layerId: string, enabled: boolean) => {
    set((state) => {
      const entry = state.entries.get(layerId)
      if (!entry) return state

      const newEntries = new Map(state.entries)
      newEntries.set(layerId, {
        ...entry,
        enabled,
      })
      return { entries: newEntries }
    })
  },
}))

