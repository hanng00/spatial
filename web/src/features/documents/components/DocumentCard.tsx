"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { partyColors, partyNames } from "@/features/datalayers/documentGeography";
import { Building2, Calendar, ExternalLink } from "lucide-react";
import { type ReactNode } from "react";

export type DocumentCardData = {
  dok_id: string;
  document_title: string | null;
  document_date: string | null;
  document_type: string | null;
  committee?: string | null;
  party?: string | null;
  role?: string | null;
  parliamentary_session?: string | null;
};

type DocumentCardProps = {
  document: DocumentCardData;
  index?: number;
  onSelect?: (dokId: string) => void;
  metaBadges?: ReactNode;
  footerContent?: ReactNode;
};

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  frs: "Frågesedel",
  fr: "Fråga",
  mot: "Motion",
  ip: "Inskickad proposition",
  prop: "Proposition",
  bet: "Betänkande",
  rskr: "Beslut",
  votering: "Votering",
};

export function DocumentCard({
  document,
  index = 0,
  onSelect,
  metaBadges,
  footerContent,
}: DocumentCardProps) {
  const partyColor = document.party
    ? partyColors[document.party] || "bg-muted"
    : "bg-muted";
  const partyName = document.party
    ? partyNames[document.party] || document.party
    : null;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(document.dok_id)}
      className="w-full text-left group animate-fade-in-stagger"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-200 hover:shadow-md">
        <div className="mb-2 flex flex-wrap gap-2">
          <DocumentTypeBadge documentType={document.document_type} />
          {metaBadges}
        </div>

        <div className="flex items-start justify-between gap-3 mb-2">
          <h4 className="font-medium text-sm text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {document.document_title || document.dok_id}
          </h4>
          <ExternalLink className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
          {document.party && (
            <Badge
              variant="secondary"
              className={`${partyColor} text-white text-[11px] px-2 py-0.5`}
            >
              {document.party}
            </Badge>
          )}

          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDocumentDate(document.document_date)}</span>
          </div>

          {document.committee && (
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              <span className="truncate max-w-[140px]">
                {document.committee}
              </span>
            </div>
          )}

          {document.role && (
            <Badge variant="outline" className="text-[11px] px-2 py-0.5">
              {document.role}
            </Badge>
          )}
        </div>

        {footerContent ? (
          <div className="mt-2 text-xs text-muted-foreground">{footerContent}</div>
        ) : (
          partyName && (
            <div className="mt-2 text-xs text-muted-foreground">{partyName}</div>
          )
        )}
      </div>
    </button>
  );
}

export function DocumentCardSkeleton() {
  return (
    <div className="p-4 rounded-lg border border-border bg-card/50">
      <Skeleton className="h-4 w-24 mb-3" />
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

function DocumentTypeBadge({
  documentType,
}: {
  documentType: DocumentCardData["document_type"];
}) {
  if (!documentType) {
    return <Badge variant="outline">Okänd</Badge>;
  }

  const label = DOCUMENT_TYPE_LABELS[documentType] ?? documentType.toUpperCase();
  const variant = documentType === "frs" ? "secondary" : "outline";

  return <Badge variant={variant}>{label}</Badge>;
}

function formatDocumentDate(dateStr: string | null): string {
  if (!dateStr) return "Datum saknas";
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

