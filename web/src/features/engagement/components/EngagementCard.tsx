"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { EngagementRow } from "../api/types";
import { usePoliticianActivity } from "../hooks/usePoliticianActivity";

function formatDate(d: string | null) {
  if (!d) return "–";
  try {
    return new Date(d).toLocaleDateString("sv-SE");
  } catch {
    return d;
  }
}

type ActivitySectionProps = {
  title: string;
  emptyLabel: string;
  items: ReactNode[];
};

function ActivitySection({ title, emptyLabel, items }: ActivitySectionProps) {
  return (
    <div className="space-y-2">
      <div className="text-foreground text-sm font-semibold">{title}</div>
      {items.length > 0 ? (
        <ItemGroup className="rounded-md border bg-card/50">
          {items}
        </ItemGroup>
      ) : (
        <div className="text-xs text-muted-foreground">{emptyLabel}</div>
      )}
    </div>
  );
}

type Props = {
  row: EngagementRow;
  rank?: number;
  compact?: boolean;
  windowDays?: number;
};

export function EngagementCard({ row, rank, compact, windowDays }: Props) {
  const yes = row.yes_votes ?? 0;
  const no = row.no_votes ?? 0;
  const abstain = row.abstain_votes ?? 0;
  const votes = row.votes ?? 0;
  const [expanded, setExpanded] = useState(false);
  const { data: detail, isLoading } = usePoliticianActivity(
    expanded ? row.intressent_id : null
  );

  const docsPts = (row.documents_authored ?? 0) * 3;
  const votePts = votes * 2;
  const speechPts = (row.speeches ?? 0) * 1;
  const totalPts = row.score ?? docsPts + votePts + speechPts;
  const docItems: ReactNode[] =
    detail?.docs?.map((d) => (
      <Item
        key={d.dok_id}
        variant="muted"
        size="sm"
        className="justify-between"
      >
        <ItemContent>
          <ItemTitle className="text-sm text-foreground">
            {d.document_title || d.dok_id}
          </ItemTitle>
          <ItemDescription>
            {(d.derived_doc_type || "Dokument") + " • " + formatDate(d.document_date)}
          </ItemDescription>
        </ItemContent>
        <ItemActions onClick={(e) => e.stopPropagation()}>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/docs?q=${d.dok_id}`}>Öppna</Link>
          </Button>
        </ItemActions>
      </Item>
    )) ?? [];
  const voteItems: ReactNode[] =
    detail?.votes?.map((v) => (
      <Item
        key={`${v.dok_id}-${v.vote_timestamp ?? v.vote_choice ?? "vote"}`}
        variant="muted"
        size="sm"
        className="justify-between"
      >
        <ItemContent>
          <ItemTitle className="text-sm text-foreground">
            {v.document_title || v.dok_id}
          </ItemTitle>
          <ItemDescription>
            {(v.vote_choice || "Röst") +
              " • " +
              formatDate(v.document_date) +
              (v.vote_description ? ` – ${v.vote_description}` : "")}
          </ItemDescription>
        </ItemContent>
        <ItemActions className="gap-2" onClick={(e) => e.stopPropagation()}>
          {v.vote_choice && <Badge variant="outline">{v.vote_choice}</Badge>}
          <Button asChild variant="ghost" size="sm">
            <Link href={`/docs?q=${v.dok_id}`}>Öppna</Link>
          </Button>
        </ItemActions>
      </Item>
    )) ?? [];
  const speechItems: ReactNode[] =
    detail?.speeches?.map((s) => (
      <Item
        key={s.speech_id}
        variant="muted"
        size="sm"
        className="justify-between"
      >
        <ItemContent>
          <ItemTitle className="text-sm text-foreground">
            {s.document_title || s.dok_id}
          </ItemTitle>
          <ItemDescription>
            {(s.parliamentary_session || "Debatt") +
              " • " +
              formatDate(s.document_date)}
          </ItemDescription>
        </ItemContent>
        <ItemActions onClick={(e) => e.stopPropagation()}>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/docs?q=${s.dok_id}`}>Öppna</Link>
          </Button>
        </ItemActions>
      </Item>
    )) ?? [];

  return (
    <div
      className="border rounded-lg p-3 bg-card/60 backdrop-blur-sm hover:border-primary transition"
      onClick={() => !compact && setExpanded((e) => !e)}
      role="button"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {rank !== undefined && <Badge variant="secondary">{rank}</Badge>}
          <div>
            <div className="font-semibold">{row.display_name || row.intressent_id}</div>
            <div className="text-sm text-muted-foreground">
                {row.party || "?"} • {row.electoral_district || "unknown"}
            </div>
          </div>
        </div>
        <Link href={`/docs?q=${row.intressent_id}`} className="text-sm text-primary hover:underline">
            Open documents
        </Link>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        <div>
          <span className="text-foreground font-semibold">{row.documents_authored ?? 0}</span> docs
        </div>
        <div>
          <span className="text-foreground font-semibold">{votes}</span> votes
        </div>
        <div>
          <span className="text-foreground font-semibold">{row.speeches ?? 0}</span> speeches
        </div>
      </div>

      <div className="mt-1 text-xs text-muted-foreground">
        Yes {yes} • No {no} • Abstain {abstain}
      </div>

      {!compact && expanded && (
        <div className="mt-3 space-y-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">Poäng {totalPts}</Badge>
            {windowDays ? (
              <Badge variant="outline">{windowDays} dagar</Badge>
            ) : (
              <Badge variant="outline">Tidsfönster</Badge>
            )}
          </div>
          <div>
          <div className="text-foreground font-semibold">Score breakdown</div>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Documents: {row.documents_authored ?? 0} × 3 = {docsPts}
            </li>
            <li>
              Votes: {votes} × 2 = {votePts}
            </li>
            <li>
              Speeches: {row.speeches ?? 0} × 1 = {speechPts}
            </li>
          </ul>
          </div>
          <div className="flex flex-wrap gap-4">
          <div>
              Last activity:{" "}
              <span className="text-foreground">
                {formatDate(row.last_activity_date)}
              </span>
          </div>
          <div>
              First activity:{" "}
              <span className="text-foreground">
                {formatDate(row.first_activity_date)}
              </span>
            </div>
          </div>
          {isLoading ? (
            <div>Loading activity…</div>
          ) : (
            <div className="space-y-3">
              <ActivitySection
                title="Latest documents"
                emptyLabel="No recent documents."
                items={docItems}
              />
              <ActivitySection
                title="Latest votes"
                emptyLabel="No recent votes."
                items={voteItems}
              />
              <ActivitySection
                title="Latest speeches"
                emptyLabel="No recent speeches."
                items={speechItems}
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Link href={`/docs?q=${row.intressent_id}`}>
              <Button variant="ghost" size="xs">
                Open documents
              </Button>
            </Link>
            <Link href={`/map`}>
              <Button variant="ghost" size="xs">
                Show on map
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

