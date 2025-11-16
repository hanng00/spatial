"use client";

import DeckGL from "@deck.gl/react";
import { Map } from "@vis.gl/react-maplibre";
import type { Layer } from "@deck.gl/core";
import { MAP_STYLE_URL } from "../lib/mapUtils";
import type { MapViewState } from "../stores/mapStore";
import { useMapStore } from "../stores/mapStore";
import React from "react";

type GetTooltipType = React.ComponentProps<typeof DeckGL>["getTooltip"];

interface BaseMapLayerProps {
  layers?: Layer[];
  children?: React.ReactNode;
  getTooltip?: GetTooltipType;
}

/**
 * BaseMapLayer - The foundational map layer
 * Handles the base map rendering and view state
 *
 * Following deck.gl SSR best practices: https://deck.gl/docs/get-started/using-with-react#using-deckgl-with-ssr
 */
export function BaseMapLayer({
  layers,
  children,
  getTooltip,
}: BaseMapLayerProps) {
  const viewState = useMapStore((state) => state.viewState);
  const setViewState = useMapStore((state) => state.setViewState);

  // Don't render on server
  if (typeof window === "undefined") {
    return <div style={{ width: "100%", height: "100%" }} />;
  }

  return (
    <DeckGL
      viewState={viewState}
      onViewStateChange={({ viewState: newViewState }) => {
        const updatedState = newViewState as MapViewState;
        setViewState({
          longitude: updatedState.longitude,
          latitude: updatedState.latitude,
          zoom: updatedState.zoom,
        });
      }}
      controller={true}
      layers={layers}
      getTooltip={getTooltip}
      style={{ width: "100%", height: "100%" }}
    >
      <Map
        mapStyle={MAP_STYLE_URL}
        reuseMaps
        gl={null as unknown as WebGLRenderingContext}
      />
      {children}
    </DeckGL>
  );
}
