/**
 * Map Layers Setup Hook
 * Initializes and registers layers with the registry
 * Should be called once at the app/map level
 */

'use client'

import {
  documentGeographyLayerDefinition,
  type DocumentGeographyLayerConfig,
} from '@/features/datalayers/documentGeography'
import { useEffect } from 'react'
import { useLayerRegistryStore } from '../stores/layerRegistryStore'

interface UseMapLayersSetupOptions {
  /** Initial configuration for document geography layer */
  documentGeographyConfig?: Partial<DocumentGeographyLayerConfig>
}

/**
 * Hook to set up and register map layers
 * Call this once at the map component level
 */
export function useMapLayersSetup(options: UseMapLayersSetupOptions = {}) {
  const register = useLayerRegistryStore((state) => state.register)

  useEffect(() => {
    // Register document geography layer
    register(documentGeographyLayerDefinition, {
      id: documentGeographyLayerDefinition.metadata.id,
      enabled: true,
      visible: true,
      opacity: 1,
      ...options.documentGeographyConfig,
    })

    // Cleanup: layers will be unregistered when component unmounts
    // In a more complex app, you might want to keep layers registered
    // and just enable/disable them
  }, [register, options.documentGeographyConfig])
}

