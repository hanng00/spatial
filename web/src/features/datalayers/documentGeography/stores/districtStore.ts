"use client";

import { create } from "zustand";
import type { DocumentGeographyPoint } from "../adapters/documentGeographyAdapter";

/**
 * Store for managing selected district state
 * Handles district selection and sheet visibility
 */
interface DistrictStore {
  selectedDistrict: DocumentGeographyPoint | null;
  isDistrictSheetOpen: boolean;
  setSelectedDistrict: (district: DocumentGeographyPoint | null) => void;
  openDistrictSheet: (district: DocumentGeographyPoint) => void;
  closeDistrictSheet: () => void;
}

export const useDistrictStore = create<DistrictStore>((set) => ({
  selectedDistrict: null,
  isDistrictSheetOpen: false,
  setSelectedDistrict: (district) =>
    set({ selectedDistrict: district }),
  openDistrictSheet: (district) =>
    set({ selectedDistrict: district, isDistrictSheetOpen: true }),
  closeDistrictSheet: () =>
    set({ isDistrictSheetOpen: false }),
}));

