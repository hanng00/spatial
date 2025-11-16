"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapHeader } from "./components/MapHeader";
import { MapControlsPanel } from "./components/MapControlsPanel";
import { MapInfoPanel } from "./components/MapInfoPanel";

type ClientMapProps = {
  selectedYear: number;
  selectedMonth: number | undefined;
};

const ClientMap = dynamic<ClientMapProps>(
  () => import("@/components/ClientMap").then((mod) => ({ default: mod.ClientMap })),
  {
    ssr: false,
  }
);

export default function MapPage() {
  const [showControls, setShowControls] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(
    undefined
  );

  return (
    <div className="relative h-screen w-full bg-muted">
      <MapHeader onToggleControls={() => setShowControls(!showControls)} />

      <div className="h-full w-full">
        <ClientMap selectedYear={selectedYear} selectedMonth={selectedMonth} />
      </div>

      {showControls && (
        <MapControlsPanel
          onClose={() => setShowControls(false)}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
        />
      )}

      <MapInfoPanel />
    </div>
  );
}
