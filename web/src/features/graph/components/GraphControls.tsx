"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { EngagementRow } from "@/features/engagement/api/types";
import type { DocumentSearchResult } from "@/features/documents/api/types";
import { Link2, Network, Search, Users } from "lucide-react";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  focusId: string | null;
  onSelectFocus: (id: string) => void;
  relationTypes: string[];
  onToggleRelation: (value: string) => void;
  startDate: string | null;
  onStartDateChange: (value: string | null) => void;
  limit: number;
  onLimitChange: (value: number) => void;
  suggestions: DocumentSearchResult[];
  searching: boolean;
  leaders?: EngagementRow[];
  edgeCount: number;
  nodeCount: number;
};

export function GraphControls({
  query,
  onQueryChange,
  focusId,
  onSelectFocus,
  relationTypes,
  onToggleRelation,
  startDate,
  onStartDateChange,
  limit,
  onLimitChange,
  suggestions,
  searching,
  leaders,
  edgeCount,
  nodeCount,
}: Props) {
  return (
    <Card className="pointer-events-auto bg-card/85 backdrop-blur border-primary/30 shadow-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Network className="h-5 w-5 text-primary" />
          Map the network
        </CardTitle>
        {leaders && leaders.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {leaders.map((row, idx) => (
              <Badge
                key={row.intressent_id}
                variant={focusId === row.intressent_id ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  onSelectFocus(row.intressent_id);
                  onQueryChange(row.intressent_id);
                }}
              >
                #{idx + 1} {row.display_name || row.intressent_id}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Search or enter ID</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="dok_id or intressent_id"
              className="pl-10"
            />
          </div>
          {query.trim().length > 2 && (
            <div className="rounded-md border border-primary/20 bg-muted/30">
              <ScrollArea className="max-h-40">
                <div className="divide-y divide-border/60">
                  {searching && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">Searching…</div>
                  )}
                  {suggestions.slice(0, 6).map((doc) => (
                    <button
                      key={doc.dok_id}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-primary/5 transition"
                      onClick={() => {
                        onSelectFocus(doc.dok_id);
                        onQueryChange(doc.dok_id);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{doc.derived_doc_type ?? "doc"}</Badge>
                        <span className="font-medium">{doc.document_title ?? doc.dok_id}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {doc.rm} • {doc.committee}
                      </div>
                    </button>
                  ))}
                  {!searching && suggestions.length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No suggestions yet. Enter an id to start.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Relations</div>
          <div className="flex flex-wrap gap-2">
            {["reference", "person_involved", "speech", "vote"].map((rel) => (
              <Badge
                key={rel}
                variant={relationTypes.includes(rel) ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => onToggleRelation(rel)}
              >
                {rel.replace("_", " ")}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <div className="text-muted-foreground">Start date</div>
            <Input
              type="date"
              value={startDate ?? ""}
              onChange={(e) => onStartDateChange(e.target.value || null)}
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Edge limit</div>
            <Input
              type="number"
              min={50}
              max={800}
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value) || 300)}
              className="text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>
            {edgeCount} edges • {nodeCount} nodes
          </div>
          <div>Time: {startDate ? `from ${startDate}` : "no start bound"}</div>
        </div>

        <Button className="w-full gap-2" onClick={() => focusId && onSelectFocus(focusId)}>
          Map the network
          <Link2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

