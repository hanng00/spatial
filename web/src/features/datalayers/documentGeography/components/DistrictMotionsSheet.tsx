"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DocumentCard,
  DocumentCardSkeleton,
} from "@/features/documents/components/DocumentCard";
import { useMapStore } from "@/features/map/stores/mapStore";
import { FileText } from "lucide-react";
import { useState } from "react";
import { useMotions } from "../hooks/useMotions";
import { useDistrictStore } from "../stores/districtStore";
import { MotionDetailDialog } from "./MotionDetailDialog";

export function DistrictMotionsSheet() {
  const { selectedDistrict, isDistrictSheetOpen, closeDistrictSheet } =
    useDistrictStore();
  const { dataLayerConfig } = useMapStore();

  const [selectedMotionId, setSelectedMotionId] = useState<string | null>(null);

  // Get filter config from store
  const selectedYear = dataLayerConfig.timefilter.startDate?.getFullYear();
  // Convert month from 0-11 (JavaScript) to 1-12 (API format)
  // Only include month if endDate exists (indicating a month filter is active)
  const selectedMonth =
    dataLayerConfig.timefilter.endDate && dataLayerConfig.timefilter.startDate
      ? dataLayerConfig.timefilter.startDate.getMonth() + 1
      : undefined;

  // Fetch motions for selected district
  const {
    data: motions,
    isLoading,
    isError,
  } = useMotions({
    district: selectedDistrict?.electoral_district || null,
    year: selectedYear,
    month: selectedMonth,
    enabled: isDistrictSheetOpen && !!selectedDistrict,
  });

  const selectedMotion =
    motions.find((m) => m.dok_id === selectedMotionId) || null;

  return (
    <>
      <Sheet
        open={isDistrictSheetOpen}
        onOpenChange={(open) => !open && closeDistrictSheet()}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg border-l border-primary/20 bg-card/95 backdrop-blur-md"
        >
          <SheetHeader className="pb-4 border-b border-border">
            <SheetTitle className="text-xl font-serif text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {selectedDistrict?.name || "Välj valkrets"}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              {selectedDistrict ? (
                <>
                  <span className="text-primary font-medium">
                    {isLoading ? selectedDistrict.motion_count : motions.length}
                  </span>{" "}
                  motioner från riksdagsledamöter i denna valkrets
                </>
              ) : (
                "Klicka på en markering på kartan för att se motioner"
              )}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-140px)] p-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <DocumentCardSkeleton key={i} />
                ))}
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-destructive mb-2">
                  Kunde inte ladda motioner
                </div>
                <p className="text-sm text-muted-foreground">
                  Försök igen senare
                </p>
              </div>
            ) : motions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <div className="text-muted-foreground">
                  Inga motioner hittades
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Prova att ändra tidsperioden
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {motions.map((motion, index) => (
                  <DocumentCard
                    key={motion.dok_id}
                    document={motion}
                    index={index}
                    onSelect={setSelectedMotionId}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <MotionDetailDialog
        motion={selectedMotion}
        open={!!selectedMotionId}
        onClose={() => setSelectedMotionId(null)}
      />
    </>
  );
}
