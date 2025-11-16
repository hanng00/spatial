'use client'

import { create } from 'zustand'

export interface MapViewState {
  longitude: number
  latitude: number
  zoom: number
  pitch: number
  bearing: number
}

interface MapStore {
  viewState: MapViewState
  setViewState: (updates: Partial<MapViewState>) => void
}

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: 18.0686, // Stockholm, Sweden
  latitude: 59.3293,
  zoom: 10,
  pitch: 0,
  bearing: 0,
}

export const useMapStore = create<MapStore>((set) => ({
  viewState: INITIAL_VIEW_STATE,
  setViewState: (updates) =>
    set((state) => ({
      viewState: { ...state.viewState, ...updates },
    })),
}))

