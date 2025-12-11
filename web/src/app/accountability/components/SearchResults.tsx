"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, MessageSquare, Vote } from "lucide-react";
import type { PoliticianSearchResult } from "../types";

type Props = {
  query: string;
  results: PoliticianSearchResult[];
  isLoading: boolean;
  isError: boolean;
  onSelect: (intressentId: string) => void;
  selectedId: string | null;
  minQueryLength?: number;
};

export function SearchResults({
  query,
  results,
  isLoading,
  isError,
  onSelect,
  selectedId,
  minQueryLength = 2,
}: Props) {
  const trimmedQuery = query.trim();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Search results</CardTitle>
      </CardHeader>
      <CardContent>
        {trimmedQuery.length < minQueryLength ? (
          <EmptyState>
            Type at least {minQueryLength} characters to start searching.
          </EmptyState>
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-16 w-full" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState>Could not load search results.</EmptyState>
        ) : results.length === 0 ? (
          <EmptyState>No politicians matched your search.</EmptyState>
        ) : (
          <ScrollArea className="h-[60vh] pr-3">
            <ItemGroup className="space-y-2">
              {results.map((row) => (
                <button
                  key={row.intressent_id}
                  type="button"
                  onClick={() => onSelect(row.intressent_id)}
                  className="text-left w-full"
                >
                  <Item
                    variant={row.intressent_id === selectedId ? "default" : "muted"}
                    className="justify-between"
                  >
                    <ItemContent>
                      <ItemTitle className="text-sm font-semibold break-words">
                        {row.display_name || row.intressent_id}
                      </ItemTitle>
                      <ItemDescription className="break-words">
                        {row.party || "Okänd"} • {row.electoral_district || "Okänt valdistrikt"}
                      </ItemDescription>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <CountBadge icon={<FileText className="h-3 w-3" />} label="Docs" value={row.documents_authored} />
                        <CountBadge icon={<Vote className="h-3 w-3" />} label="Votes" value={row.votes} />
                        <CountBadge
                          icon={<MessageSquare className="h-3 w-3" />}
                          label="Speeches"
                          value={row.speeches}
                        />
                      </div>
                    </ItemContent>
                    <Badge variant="outline" className="shrink-0">
                      {row.last_activity_date ? formatDate(row.last_activity_date) : "No activity date"}
                    </Badge>
                  </Item>
                </button>
              ))}
            </ItemGroup>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-muted-foreground">{children}</div>;
}

function CountBadge({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
}) {
  return (
    <span className="flex items-center gap-1">
      {icon}
      <span>
        {value ?? 0} {label}
      </span>
    </span>
  );
}

function formatDate(value: string | null) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString("sv-SE");
  } catch {
    return value;
  }
}
