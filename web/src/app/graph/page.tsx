"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { useDocumentSearch } from "@/features/documents/hooks/useDocuments";
import { useEngagementLeaderboard } from "@/features/engagement/hooks/useEngagement";
import { GraphControls } from "@/features/graph/components/GraphControls";
import { GraphViz } from "@/features/graph/components/GraphViz";
import { useGraph } from "@/features/graph/hooks/useGraph";
import { useEffect, useMemo, useState } from "react";

export default function GraphPage() {
  const [query, setQuery] = useState("");
  const [focusId, setFocusId] = useState<string | null>(null);
  const [relationTypes, setRelationTypes] = useState<string[]>([
    "reference",
    "person_involved",
    "speech",
    "vote",
  ]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [limit, setLimit] = useState(300);

  const { data: leaders } = useEngagementLeaderboard({ window_days: 7, limit: 3 });

  const {
    data: suggestionsPages,
    isFetching: searching,
  } = useDocumentSearch({ q: query, limit: 6, enabled: query.trim().length > 2 });

  const suggestions = useMemo(
    () => (suggestionsPages?.pages || []).flat().filter(Boolean),
    [suggestionsPages]
  );

  const { data, isLoading, isError } = useGraph({
    id: focusId,
    relationTypes,
    start: startDate,
    end: null,
    limit,
    offset: 0,
  });

  useEffect(() => {
    if (!focusId && leaders && leaders.length > 0) {
      setFocusId(leaders[0].intressent_id);
      setQuery(leaders[0].intressent_id);
    }
  }, [leaders, focusId]);

  const onToggleRelation = (value: string) => {
    setRelationTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,119,6,0.08),transparent_50%)]" />
        <div className="absolute inset-0 pattern-grid opacity-10" />
        <div className="absolute inset-0">
          {isError ? (
            <div className="flex h-full items-center justify-center text-destructive">
              Could not load the network.
            </div>
          ) : (
            <GraphViz nodes={data?.nodes ?? []} edges={data?.edges ?? []} focusId={focusId} />
          )}
          {isLoading && (
            <div className="absolute top-4 right-4 text-sm text-muted-foreground">Loading…</div>
          )}
          <div className="absolute top-4 right-4 flex items-center gap-2 text-xs text-muted-foreground bg-card/70 backdrop-blur border border-primary/20 rounded-full px-3 py-1">
            <span>{data?.edges.length ?? 0} edges</span>
            <span>•</span>
            <span>{data?.nodes.length ?? 0} nodes</span>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-4 left-4 right-4 md:right-auto md:max-w-md">
          <GraphControls
            query={query}
            onQueryChange={setQuery}
            focusId={focusId}
            onSelectFocus={setFocusId}
            relationTypes={relationTypes}
            onToggleRelation={onToggleRelation}
            startDate={startDate}
            onStartDateChange={setStartDate}
            limit={limit}
            onLimitChange={setLimit}
            suggestions={suggestions}
            searching={searching}
            leaders={leaders}
            edgeCount={data?.edges.length ?? 0}
            nodeCount={data?.nodes.length ?? 0}
          />
        </div>
      </main>
    </div>
  );
}

