"use client";

import { useMapLayers } from "../app/map/hooks/useMapLayers";
import { useDocumentGeography } from "../app/map/hooks/useDocumentGeography";
import { getMapTooltip } from "../app/map/lib/mapTooltip";
import type { MapDocumentPoint } from "../app/map/lib/mapData";
import { BaseMapLayer } from "./BaseMapLayer";

type Props = {
  selectedYear: number;
  selectedMonth: number | undefined;
};
export const ClientMap = ({ selectedYear, selectedMonth }: Props) => {
  // Fetch document geography data
  const { data: geographyData } = useDocumentGeography({
    year: selectedYear,
    month: selectedMonth,
  });
  const layers = useMapLayers({
    data: geographyData,
    onPointClick: (point: MapDocumentPoint) => {
      console.log("Clicked district:", point);
      // TODO: Show district details in info panel
    },
  });

  return (
    <BaseMapLayer
      layers={layers}
      getTooltip={({ object }) => getMapTooltip(object)}
    />
  );
};
