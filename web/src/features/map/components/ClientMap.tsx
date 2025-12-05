"use client";

import {
  useDocumentGeographyData,
  useDistrictStore,
  type DocumentGeographyPoint,
} from "@/features/datalayers/documentGeography";
import { BaseMapLayer } from "@/features/map/components/BaseMapLayer";
import { LayerComposer } from "@/features/map/components/LayerComposer";
import { useMapLayersSetup } from "@/features/map/hooks/useMapLayersSetup";
import type { LayerClickEvent } from "@/features/map/layers/base/types";
import { useCallback, useMemo } from "react";
import { useMapStore } from "../stores/mapStore";

export const ClientMap = () => {
  // Initialize layer registry
  useMapLayersSetup();

  // Get filter config from map store
  const dataLayerConfig = useMapStore((state) => state.dataLayerConfig);
  const selectedYear = dataLayerConfig.timefilter.startDate?.getFullYear();
  // Convert month from 0-11 (JavaScript) to 1-12 (API format)
  // Only include month if endDate exists (indicating a month filter is active)
  const selectedMonth = dataLayerConfig.timefilter.endDate && dataLayerConfig.timefilter.startDate
    ? dataLayerConfig.timefilter.startDate.getMonth() + 1
    : undefined;

  // Get district actions from datalayer store
  const openDistrictSheet = useDistrictStore((state) => state.openDistrictSheet);

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

  // Handle layer interactions - open sheet with motions for clicked district
  const handleLayerClick = useCallback(
    (event: LayerClickEvent) => {
      if (event.layerId === "document-geography-layer" && event.object) {
        const district = event.object as DocumentGeographyPoint;
        openDistrictSheet(district);
      }
    },
    [openDistrictSheet]
  );

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
