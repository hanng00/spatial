"use client";

import { BaseMapLayer } from "@/features/map/components/BaseMapLayer";
import { LayerComposer } from "@/features/map/components/LayerComposer";
import { useDocumentGeographyData } from "@/features/map/data/providers/useDocumentGeographyData";
import { useMapLayersSetup } from "@/features/map/hooks/useMapLayersSetup";
import type { LayerClickEvent } from "@/features/map/layers/base/types";
import { useMemo } from "react";
import { useMapStore } from "../stores/mapStore";

export const ClientMap = () => {
  // Initialize layer registry
  useMapLayersSetup();

  // Get filter config from store
  const dataLayerConfig = useMapStore((state) => state.dataLayerConfig);
  const selectedYear = dataLayerConfig.timefilter.startDate?.getFullYear();
  const selectedMonth = dataLayerConfig.timefilter.startDate?.getMonth();

  // Fetch data using TanStack Query via data provider
  const { data: geographyData } = useDocumentGeographyData({
    year: selectedYear,
    month: selectedMonth,
  });

  // Create data map for layer composition
  const dataMap = useMemo(() => {
    const map = new Map<string, unknown[]>();
    map.set("document-geography-layer", geographyData);
    return map;
  }, [geographyData]);

  // Handle layer interactions
  const handleLayerClick = (event: LayerClickEvent) => {
    console.log("Layer clicked:", event.layerId, event.object);
    // TODO: Show district details in info panel
  };

  return (
    <LayerComposer dataMap={dataMap} onLayerClick={handleLayerClick}>
      {({ layers, getTooltip }) => (
        <BaseMapLayer
          layers={layers}
          getTooltip={(info) => {
            if (!info.object || !info.layer) return null;
            const layerId = info.layer.id;
            if (!layerId) return null;
            const tooltip = getTooltip(layerId, info.object);
            if (!tooltip) return null;
            return {
              html: tooltip.html,
              style: tooltip.style as Partial<CSSStyleDeclaration>,
            };
          }}
        />
      )}
    </LayerComposer>
  );
};
