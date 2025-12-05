/**
 * Document Geography Data Layer
 * 
 * Provides visualization of riksdag documents by electoral district.
 * Co-located components, hooks, adapters, and stores for this data layer.
 */

// Components
export { DistrictMotionsSheet } from "./components/DistrictMotionsSheet";
export { MotionDetailDialog } from "./components/MotionDetailDialog";

// Hooks
export { useDocumentGeographyData } from "./hooks/useDocumentGeographyData";
export { useMotions } from "./hooks/useMotions";

// Layers
export { documentGeographyLayerDefinition } from "./layers/DocumentGeographyLayer";
export type { DocumentGeographyLayerConfig } from "./layers/DocumentGeographyLayer";

// Adapters
export { documentGeographyAdapter, documentGeographyQueryAdapter } from "./adapters/documentGeographyAdapter";
export type { DocumentGeographyPoint } from "./adapters/documentGeographyAdapter";

// Stores
export { useDistrictStore } from "./stores/districtStore";

// Lib
export { fetchDocumentGeography } from "./lib/documentGeographyApi";
export { fetchMotions, getMotionUrl, getMotionHtmlUrl, partyNames, partyColors } from "./lib/motionsApi";
export type { Motion } from "./lib/motionsApi";
export { getDistrictCoordinates, ELECTORAL_DISTRICT_COORDINATES } from "./lib/electoralDistricts";

