"use client";

import { DistrictMotionsSheet } from "@/features/datalayers/documentGeography";
import { MapControlsPanel } from "@/features/map/components/MapControlsPanel";
import { MapHeader } from "@/features/map/components/MapHeader";
import dynamic from "next/dynamic";
import { useState } from "react";

const ClientMap = dynamic(
  () =>
    import("@/features/map/components/ClientMap").then((mod) => ({
      default: mod.ClientMap,
    })),
  {
    ssr: false,
  }
);

export default function MapPage() {
  const [showControls, setShowControls] = useState(true);

  return (
    <div className="relative h-screen w-full bg-muted">
      <MapHeader onToggleControls={() => setShowControls(!showControls)} />

      <div className="h-full w-full">
        <ClientMap />
      </div>

      {showControls && (
        <MapControlsPanel onClose={() => setShowControls(false)} />
      )}

      {/* District motions sheet - controlled by datalayer store */}
      <DistrictMotionsSheet />
    </div>
  );
}
