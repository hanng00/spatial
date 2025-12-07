"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  DocumentEdge,
  DocumentGeographyPoint,
  DocumentSearchResult,
  DocumentVote,
} from "@/features/documents/api/types";
import {
  DocumentCard,
  DocumentCardSkeleton,
} from "@/features/documents/components/DocumentCard";
import {
  useDocumentDetail,
  useDocumentGeography,
  useDocumentGraph,
  useDocumentSearch,
  useDocumentVotes,
} from "@/features/documents/hooks/useDocuments";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type FilterState = {
  q: string;
  type: string;
  rm: string;
  topic: string;
  committee: string;
};

const docTypeLabels: Record<string, string> = {
  mot: "Motion",
  prop: "Proposition",
  bet: "Betänkande",
  fr: "Fråga",
  frs: "Svar",
  ip: "Interpellation",
  rskr: "Rskr",
  kammakt: "Kammakt",
  votering: "Votering",
};

function typeLabel(t: string | null) {
  if (!t) return "Okänd";
  return docTypeLabels[t] ?? t;
}

const relationTypeLabels: Record<string, string> = {
  reference: "Referens",
  vote: "Votering",
  speech: "Anförande",
  person_involved: "Koppling person",
  proposition: "Proposition",
  betankande: "Betänkande",
  decision: "Beslut",
};

function formatDate(d: string | null) {
  if (!d) return "–";
  try {
    return new Date(d).toLocaleDateString("sv-SE");
  } catch {
    return d;
  }
}

function aggregateGeography(points: DocumentGeographyPoint[]) {
  const districts = new Set<string>();
  const parties = new Set<string>();
  points.forEach((p) => {
    if (p.electoral_district) districts.add(p.electoral_district);
    if (p.party) parties.add(p.party);
  });
  return {
    district_count: districts.size,
    party_count: parties.size,
  };
}

function summarizeVotes(votes: DocumentVote[]) {
  const counts = { Ja: 0, Nej: 0, Avstår: 0, Other: 0 };
  votes.forEach((v) => {
    if (v.vote_choice === "Ja") counts.Ja += 1;
    else if (v.vote_choice === "Nej") counts.Nej += 1;
    else if (v.vote_choice === "Avstår") counts.Avstår += 1;
    else counts.Other += 1;
  });
  return counts;
}

function relatedDocs(edges: DocumentEdge[]) {
  const refs: string[] = [];
  edges.forEach((e) => {
    if (e.relation_type === "reference" && e.target_id) refs.push(e.target_id);
    if (e.relation_type === "reference" && e.source_id) refs.push(e.source_id);
  });
  return Array.from(new Set(refs)).slice(0, 8);
}

type GraphNode = {
  dok_id: string;
  document_title: string | null;
  derived_doc_type: string | null;
  rm: string | null;
  committee: string | null;
  document_date: string | null;
  outgoing_edges: number | null;
  incoming_edges: number | null;
};

type DocStage =
  | "proposition"
  | "betankande"
  | "decision"
  | "vote"
  | "motion"
  | "other";

const stageRank: Record<DocStage, number> = {
  proposition: 1,
  betankande: 2,
  decision: 3,
  vote: 4,
  motion: 0,
  other: 5,
};

function stageFromType(t: string | null): DocStage {
  if (!t) return "other";
  if (t === "prop") return "proposition";
  if (t === "bet") return "betankande";
  if (t === "rskr") return "decision";
  if (t === "votering") return "vote";
  if (t === "mot") return "motion";
  return "other";
}

function toGraphNode(raw: unknown): GraphNode | null {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as Partial<Record<keyof GraphNode, unknown>>;
  const dokId = typeof candidate.dok_id === "string" ? candidate.dok_id : null;
  if (!dokId) return null;

  const stringOrNull = (value: unknown): string | null =>
    typeof value === "string" ? value : null;
  const numberOrNull = (value: unknown): number | null =>
    typeof value === "number" ? value : null;

  return {
    dok_id: dokId,
    document_title: stringOrNull(candidate.document_title),
    derived_doc_type: stringOrNull(candidate.derived_doc_type),
    rm: stringOrNull(candidate.rm),
    committee: stringOrNull(candidate.committee),
    document_date: stringOrNull(candidate.document_date),
    outgoing_edges: numberOrNull(candidate.outgoing_edges),
    incoming_edges: numberOrNull(candidate.incoming_edges),
  };
}

export default function DocsPage() {
  const [filters, setFilters] = useState<FilterState>({
    q: "",
    type: "",
    rm: "",
    topic: "",
    committee: "",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    data: docsPages,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDocumentSearch({
    ...filters,
    limit: 50,
  });

  const allDocs = useMemo(() => {
    const seen = new Set<string>();
    const flattened: DocumentSearchResult[] = [];
    docsPages?.pages?.forEach((page) => {
      page?.forEach((doc) => {
        if (!doc?.dok_id) return;
        if (seen.has(doc.dok_id)) return;
        seen.add(doc.dok_id);
        flattened.push(doc);
      });
    });
    return flattened;
  }, [docsPages]);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (
          entry.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !isLoading
        ) {
          fetchNextPage();
        }
      });
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading]);

  const { data: detail } = useDocumentDetail(selectedId);
  const { data: geography } = useDocumentGeography(selectedId);
  const { data: votes } = useDocumentVotes(selectedId);
  const { data: graph } = useDocumentGraph(selectedId);
  const geoAgg = useMemo(
    () => aggregateGeography(geography || []),
    [geography]
  );
  const voteAgg = useMemo(() => summarizeVotes(votes || []), [votes]);
  const refDocs = useMemo(
    () => relatedDocs(graph?.edges || []),
    [graph?.edges]
  );
  const nodeLookup = useMemo(() => {
    const map: Record<string, GraphNode> = {};
    const nodes = (graph?.nodes as Partial<GraphNode>[] | undefined) ?? [];
    nodes.forEach((n) => {
      const node = toGraphNode(n);
      if (node) map[node.dok_id] = node;
    });
    const detailNode = toGraphNode(detail);
    if (detailNode) map[detailNode.dok_id] = detailNode;
    return map;
  }, [graph?.nodes, detail]);
  const currentNode = selectedId ? nodeLookup[selectedId] ?? toGraphNode(detail) : null;
  const currentStage = stageFromType(currentNode?.derived_doc_type ?? null);
  const describeRelation = useCallback((edge: DocumentEdge) => {
    const base = relationTypeLabels[edge.relation_type] ?? edge.relation_type;
    return edge.relation_subtype ? `${base} • ${edge.relation_subtype}` : base;
  }, []);
  const connections = useMemo(() => {
    if (!selectedId) return [];
    const edges = graph?.edges || [];
    return edges.flatMap((edge) => {
      const rows: Array<{
        otherId: string;
        edge: DocumentEdge;
        direction: "out" | "in";
      }> = [];
      if (edge.source_id === selectedId && edge.target_id) {
        rows.push({ otherId: edge.target_id, edge, direction: "out" });
      }
      if (edge.target_id === selectedId && edge.source_id) {
        rows.push({ otherId: edge.source_id, edge, direction: "in" });
      }
      return rows;
    });
  }, [graph?.edges, selectedId]);

  const chain = useMemo(() => {
    if (!currentNode) return [];
    const currentRank = stageRank[currentStage];
    const withStage = connections
      .map((c) => {
        const other = nodeLookup[c.otherId];
        if (!other) return null;
        const stage = stageFromType(other.derived_doc_type);
        return { ...c, other, stage, rank: stageRank[stage] };
      })
      .filter((c): c is NonNullable<typeof c> => Boolean(c));

    const prev = withStage
      .filter((c) => c.rank < currentRank)
      .sort((a, b) => b.rank - a.rank)[0];
    const next = withStage
      .filter((c) => c.rank > currentRank)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 2);

    const nodes: Array<{
      node: GraphNode;
      stage: DocStage;
      via?: DocumentEdge;
      direction?: "in" | "out";
      relationText?: string;
    }> = [];
    if (prev) {
      nodes.push({
        node: prev.other,
        stage: prev.stage,
        via: prev.edge,
        direction: prev.direction,
        relationText: describeRelation(prev.edge),
      });
    }
    nodes.push({ node: currentNode, stage: currentStage });
    next.forEach((n) =>
      nodes.push({
        node: n.other,
        stage: n.stage,
        via: n.edge,
        direction: n.direction,
        relationText: describeRelation(n.edge),
      })
    );
    return nodes;
  }, [connections, currentNode, currentStage, nodeLookup, describeRelation]);

  const otherLinks = useMemo(() => {
    const chainIds = new Set(chain.map((c) => c.node.dok_id));
    const items: ReactNode[] = [];
    connections.forEach((c, idx) => {
      if (chainIds.has(c.otherId)) return;
      const other = nodeLookup[c.otherId];
      const docType = typeLabel(other?.derived_doc_type ?? null);
      const title = other?.document_title || c.otherId;
      const relationText = `${
        c.direction === "out" ? "Går vidare till" : "Kommer från"
      } • ${describeRelation(c.edge)}`;
      items.push(
        <Item
          key={`${c.edge.relation_type}-${c.otherId}-${idx}-${c.direction}`}
          variant="muted"
          size="sm"
          className="justify-between"
        >
          <ItemContent>
            <ItemTitle className="text-sm text-foreground">{title}</ItemTitle>
            <ItemDescription>
              {relationText}
              {other?.document_date ? ` • ${formatDate(other.document_date)}` : ""}
              {other?.rm ? ` • ${other.rm}` : ""}
            </ItemDescription>
          </ItemContent>
          <ItemActions className="gap-2">
            <Badge variant="outline">{docType}</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedId(c.otherId)}
            >
              Öppna
            </Button>
          </ItemActions>
        </Item>
      );
    });
    return items;
  }, [chain, connections, describeRelation, nodeLookup, setSelectedId]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <div className="p-6 flex flex-col gap-4 container mx-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Document Explorer</h1>
            <p className="text-sm text-muted-foreground">
              Sök, läs och följ dokument, röster och geografi.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/map" className="text-sm text-primary hover:underline">
              Gå till kartan
            </Link>
            <Link
              href="/leaderboard"
              className="text-sm text-primary hover:underline"
            >
              Veckans mest aktiva
            </Link>
          </div>
        </div>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">Sök</label>
            <Input
              placeholder="Titel, utskott, fritext..."
              value={filters.q}
              onChange={(e) =>
                setFilters((f) => ({ ...f, q: e.target.value || "" }))
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">Typ</label>
            <Input
              placeholder="mot, prop, bet..."
              value={filters.type}
              onChange={(e) =>
                setFilters((f) => ({ ...f, type: e.target.value || "" }))
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">
              Riksmöte (rm)
            </label>
            <Input
              placeholder="2025/26"
              value={filters.rm}
              onChange={(e) =>
                setFilters((f) => ({ ...f, rm: e.target.value || "" }))
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">Ämne</label>
            <Input
              placeholder="education, health, crime..."
              value={filters.topic}
              onChange={(e) =>
                setFilters((f) => ({ ...f, topic: e.target.value || "" }))
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">Utskott</label>
            <Input
              placeholder="KU, FiU..."
              value={filters.committee}
              onChange={(e) =>
                setFilters((f) => ({ ...f, committee: e.target.value || "" }))
              }
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setSelectedId(null)}
            className="ml-auto"
          >
            Rensa val
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Dokument</CardTitle>
                <Link
                  href="/leaderboard"
                  className="text-sm text-primary hover:underline"
                >
                  Se veckans mest aktiva
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <ScrollArea className="h-[70vh] pr-4">
                  <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <DocumentCardSkeleton key={`motion-skeleton-${idx}`} />
                    ))}
                  </div>
                </ScrollArea>
              ) : isError ? (
                <div className="text-destructive">
                  Kunde inte ladda resultat
                </div>
              ) : (
                <ScrollArea className="h-[70vh] pr-4">
                  <div className="space-y-3">
                    {allDocs.map((d, index) => (
                      <DocumentCard
                        key={d.dok_id}
                        document={{
                          dok_id: d.dok_id,
                          document_title: d.document_title,
                          document_date: d.document_date,
                          document_type: d.derived_doc_type,
                          committee: d.committee,
                        }}
                        index={index}
                        onSelect={setSelectedId}
                        metaBadges={
                          <>
                            {d.rm && (
                              <Badge variant="secondary" className="text-xs">
                                {d.rm}
                              </Badge>
                            )}
                            {d.topic && (
                              <Badge variant="secondary" className="text-xs">
                                {d.topic}
                              </Badge>
                            )}
                            {d.derived_outcome && (
                              <Badge variant="outline" className="text-xs">
                                {d.derived_outcome}
                              </Badge>
                            )}
                          </>
                        }
                        footerContent={
                          <div>
                            Kanter ut/in: {d.outgoing_edges ?? 0}/
                            {d.incoming_edges ?? 0} • Röster: {d.vote_rows ?? 0}
                          </div>
                        }
                      />
                    ))}
                    <div ref={loadMoreRef} />
                    {isFetchingNextPage && (
                      <div className="text-sm text-muted-foreground">
                        Laddar fler…
                      </div>
                    )}
                    {!hasNextPage && allDocs.length > 0 && (
                      <div className="text-sm text-muted-foreground text-center">
                        Inga fler resultat
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalj</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!selectedId ? (
                <div className="text-sm text-muted-foreground">
                  Välj ett dokument för att se detaljer.
                </div>
              ) : !detail ? (
                <div>Laddar...</div>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">
                      {typeLabel(detail.derived_doc_type)}
                    </Badge>
                    {detail.rm && (
                      <Badge variant="secondary" className="text-xs">
                        {detail.rm}
                      </Badge>
                    )}
                    {detail.topic && (
                      <Badge variant="secondary" className="text-xs">
                        {detail.topic}
                      </Badge>
                    )}
                    {detail.derived_outcome && (
                      <Badge variant="outline" className="text-xs">
                        {detail.derived_outcome}
                      </Badge>
                    )}
                  </div>
                  <div className="font-semibold">{detail.document_title}</div>
                  <div className="text-sm text-muted-foreground">
                    {detail.committee || "Utskott saknas"} •{" "}
                    {formatDate(detail.document_date)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Kanter ut/in: {detail.outgoing_edges ?? 0}/
                    {detail.incoming_edges ?? 0} • Röster:{" "}
                    {detail.vote_rows ?? 0}
                  </div>
                  <div className="space-y-2 border-t pt-2">
                    <div className="text-sm font-medium">Geografi</div>
                    <div className="text-xs text-muted-foreground">
                      Distrikt: {geoAgg.district_count} • Partier:{" "}
                      {geoAgg.party_count}
                    </div>
                    <ScrollArea className="h-24 pr-2">
                      <div className="space-y-1">
                        {(geography || []).slice(0, 8).map((g, idx) => (
                          <div
                            key={`${g.dok_id}-${g.intressent_id}-${g.electoral_district}-${idx}`}
                            className="text-xs"
                          >
                            {g.electoral_district || "Okänd"} — {g.party || "?"}{" "}
                            ({g.role || "roll"})
                          </div>
                        ))}
                        {(geography || []).length > 8 && (
                          <div className="text-xs text-muted-foreground">
                            … fler poster
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                  <div className="space-y-2 border-t pt-2">
                    <div className="text-sm font-medium">Röster</div>
                    <div className="text-xs text-muted-foreground">
                      Ja: {voteAgg.Ja} • Nej: {voteAgg.Nej} • Avstår:{" "}
                      {voteAgg.Avstår} • Övrigt: {voteAgg.Other}
                    </div>
                    <ScrollArea className="h-24 pr-2">
                      <div className="space-y-1">
                        {(votes || []).slice(0, 8).map((v) => (
                          <div
                            key={`${v.votering_id}-${v.intressent_id}`}
                            className="text-xs"
                          >
                            {v.party || "?"} — {v.vote_choice || "?"} (
                            {v.intressent_id || ""})
                          </div>
                        ))}
                        {(votes || []).length > 8 && (
                          <div className="text-xs text-muted-foreground">
                            … fler poster
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
              <div className="space-y-2 border-t pt-2">
                <div className="text-sm font-medium">Dokumentkedja</div>
                <div className="text-xs text-muted-foreground">
                  Proposition → betänkande → beslut/votering. Aktuellt dokument markeras.
                </div>
                {chain.length > 1 ? (
                  <ItemGroup className="border rounded-md bg-card/50">
                    {chain.map((c, idx) => (
                      <Item
                        key={`${c.node.dok_id}-${idx}`}
                        variant={c.node.dok_id === selectedId ? "muted" : "default"}
                        size="sm"
                        className="justify-between"
                      >
                        <ItemContent>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {typeLabel(c.node.derived_doc_type)}
                            </Badge>
                            {c.node.rm && (
                              <Badge variant="secondary" className="text-xs">
                                {c.node.rm}
                              </Badge>
                            )}
                          </div>
                          <ItemTitle className="text-sm text-foreground">
                            {c.node.document_title || c.node.dok_id}
                          </ItemTitle>
                          <ItemDescription>
                            {c.node.dok_id === selectedId
                              ? "Aktuellt dokument"
                              : c.relationText
                                ? `${c.direction === "in" ? "Kommer från" : "Går vidare till"} • ${c.relationText}`
                                : "Del av kedjan"}
                            {c.node.document_date
                              ? ` • ${formatDate(c.node.document_date)}`
                              : ""}
                            {c.node.committee ? ` • ${c.node.committee}` : ""}
                          </ItemDescription>
                        </ItemContent>
                        <ItemActions className="gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedId(c.node.dok_id)}
                          >
                            Öppna
                          </Button>
                        </ItemActions>
                      </Item>
                    ))}
                  </ItemGroup>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Ingen tydlig kedja hittades.
                  </div>
                )}
              </div>
              <div className="space-y-2 border-t pt-2">
                <div className="text-sm font-medium">Övriga kopplingar</div>
                <div className="text-xs text-muted-foreground">
                  Referenser, tal och andra länkar som inte ingår i huvudkedjan.
                </div>
                {otherLinks.length ? (
                  <ItemGroup className="border rounded-md bg-card/50">
                    {otherLinks}
                  </ItemGroup>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Inga ytterligare kopplingar.
                  </div>
                )}
              </div>
                  <div className="space-y-2 border-t pt-2">
                    <div className="text-sm font-medium">
                      Relaterade dokument
                    </div>
                    {refDocs.length === 0 ? (
                      <div className="text-xs text-muted-foreground">
                        Inga referenser hittades.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {refDocs.map((id) => (
                          <Badge
                            key={id}
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => setSelectedId(id)}
                          >
                            {id}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
