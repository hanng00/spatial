"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useMapStore } from "@/features/map/stores/mapStore";
import { Building2, Calendar, ExternalLink, FileText } from "lucide-react";
import { useState } from "react";
import { useMotions } from "../hooks/useMotions";
import { Motion, partyColors, partyNames } from "../lib/motionsApi";
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
                  <MotionSkeleton key={i} />
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
                  <MotionCard
                    key={motion.dok_id}
                    motion={motion}
                    index={index}
                    onClick={() => setSelectedMotionId(motion.dok_id)}
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

interface MotionCardProps {
  motion: Motion;
  index: number;
  onClick: () => void;
}

function MotionCard({ motion, index, onClick }: MotionCardProps) {
  const partyColor = motion.party
    ? partyColors[motion.party] || "bg-muted"
    : "bg-muted";
  const partyName = motion.party
    ? partyNames[motion.party] || motion.party
    : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left group animate-fade-in-stagger"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-200 hover:shadow-md">
        <div className="mb-2">
          <MotionDocumentTypeBadge documentType={motion.document_type} />
        </div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h4 className="font-medium text-sm text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {motion.document_title}
          </h4>
          <ExternalLink className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {motion.party && (
            <Badge
              variant="secondary"
              className={`${partyColor} text-white text-xs px-2 py-0.5`}
            >
              {motion.party}
            </Badge>
          )}

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(motion.document_date)}</span>
          </div>

          {motion.committee && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <span className="truncate max-w-[120px]">{motion.committee}</span>
            </div>
          )}
        </div>

        {partyName && (
          <div className="mt-2 text-xs text-muted-foreground">{partyName}</div>
        )}
      </div>
    </button>
  );
}

const MotionDocumentTypeBadge = ({
  documentType,
}: {
  documentType: Motion["document_type"];
}) => {
  const documentTypeLabel = {
    frs: "Frågesedel",
    fr: "Fråga",
    mot: "Motion",
    ip: "Inskickad proposition",
  }[documentType];
  return (
    <Badge 
    variant={documentType === "frs" ? "secondary" : "outline"}
    >
      {documentTypeLabel}
    </Badge>
  );
};

function MotionSkeleton() {
  return (
    <div className="p-4 rounded-lg border border-border bg-card/50">
      <Skeleton className="h-4 w-3/4 mb-3" />
      <Skeleton className="h-3 w-1/2 mb-2" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-10 rounded-full" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
