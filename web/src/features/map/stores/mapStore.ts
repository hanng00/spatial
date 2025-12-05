"use client";

import { create } from "zustand";

/**
 * SLICE 1: View state
 * Controls the map camera position and orientation
 */
export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

interface ViewSlice {
  viewState: MapViewState;
  setViewState: (updates: Partial<MapViewState>) => void;
}

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: 18.0686, // Stockholm, Sweden
  latitude: 59.3293,
  zoom: 10,
  pitch: 0,
  bearing: 0,
};

const createViewSlice = (
  set: (
    partial: Partial<MapStore> | ((state: MapStore) => Partial<MapStore>)
  ) => void
): ViewSlice => ({
  viewState: INITIAL_VIEW_STATE,
  setViewState: (updates) =>
    set((state) => ({
      viewState: { ...state.viewState, ...updates },
    })),
});

/**
 * SLICE 2: Data layer config
 * Global filters that apply to all data layers
 */
export interface DataLayerConfig {
  timefilter: {
    startDate?: Date;
    endDate?: Date;
  };
}

interface DataLayerSlice {
  dataLayerConfig: DataLayerConfig;
  setDataLayerConfig: (updates: Partial<DataLayerConfig>) => void;
  resetDataLayerConfig: () => void;
}

const INITIAL_DATA_LAYER_CONFIG: DataLayerConfig = {
  timefilter: {
    startDate: undefined,
    endDate: undefined,
  },
};

const createDataLayerSlice = (
  set: (
    partial: Partial<MapStore> | ((state: MapStore) => Partial<MapStore>)
  ) => void
): DataLayerSlice => ({
  dataLayerConfig: INITIAL_DATA_LAYER_CONFIG,
  setDataLayerConfig: (updates) =>
    set((state) => ({
      dataLayerConfig: { ...state.dataLayerConfig, ...updates },
    })),
  resetDataLayerConfig: () =>
    set({
      dataLayerConfig: INITIAL_DATA_LAYER_CONFIG,
    }),
});

// Combined store type - base map concerns only
type MapStore = ViewSlice & DataLayerSlice;

export const useMapStore = create<MapStore>((set) => ({
  ...createViewSlice(set),
  ...createDataLayerSlice(set),
}));
