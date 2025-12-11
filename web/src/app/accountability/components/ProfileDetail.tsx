"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowUpRight, FileText, MessageSquare, Vote } from "lucide-react";
import Link from "next/link";
import type { PoliticianDetail } from "../types";

type Props = {
  selectedId: string | null;
  detail: PoliticianDetail | null;
  isLoading: boolean;
  isError: boolean;
};

export function ProfileDetail({ selectedId, detail, isLoading, isError }: Props) {
  if (!selectedId) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a politician to see their profile and recent activity.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Loading profile…</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          Failed to load this profile. Try again later.
        </CardContent>
      </Card>
    );
  }

  if (!detail) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No activity found for this politician.
        </CardContent>
      </Card>
    );
  }

  const summary = detail.summary;
  const activityStatus = deriveActivityStatus(summary?.last_activity_date);

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>{summary?.display_name || summary?.intressent_id || selectedId}</span>
          <Badge variant="outline">{summary?.intressent_id || selectedId}</Badge>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {summary?.party || "Okänt parti"} • {summary?.electoral_district || "Okänt valdistrikt"}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 overflow-y-auto pr-1">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{activityStatus}</Badge>
          <span>
            Active window: {formatDate(summary?.first_activity_date)} —{" "}
            {formatDate(summary?.last_activity_date)}
          </span>
          <span>Sessions: {summary?.parliamentary_sessions_active ?? 0}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/docs?q=${summary?.intressent_id ?? selectedId ?? ""}`}>
              Open documents
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href={`/docs?q=${summary?.intressent_id ?? selectedId ?? ""}&type=votering`}>
              View related votes
            </Link>
          </Button>
        </div>
        <StatsGrid detail={detail} />
        <Separator />
        <Section
          title="Documents"
          icon={<FileText className="h-4 w-4" />}
          emptyLabel="No documents found."
          items={detail.documents.map((doc) => ({
            id: `doc-${doc.dok_id}`,
            title: doc.document_title || doc.dok_id,
            subtitle: `${doc.derived_doc_type || "Dokument"} • ${formatDate(doc.document_date)}`,
            href: `/docs?q=${doc.dok_id}`,
          }))}
        />
        <Section
          title="Votes"
          icon={<Vote className="h-4 w-4" />}
          emptyLabel="No votes found."
          items={detail.votes.map((vote) => ({
            id: `vote-${vote.dok_id}-${vote.vote_timestamp ?? vote.vote_choice ?? "vote"}`,
            title: vote.document_title || vote.dok_id,
            subtitle: `${vote.vote_choice || "Vote"} • ${formatDate(vote.document_date)}${
              vote.vote_description ? ` – ${vote.vote_description}` : ""
            }`,
            badge: vote.vote_choice || undefined,
            href: `/docs?q=${vote.dok_id}`,
          }))}
        />
        <Section
          title="Speeches"
          icon={<MessageSquare className="h-4 w-4" />}
          emptyLabel="No speeches found."
          items={detail.speeches.map((speech) => ({
            id: `speech-${speech.speech_id}`,
            title: speech.document_title || speech.dok_id || speech.speech_id,
            subtitle: `${speech.parliamentary_session || "Session"} • ${formatDate(
              speech.document_date
            )}`,
            href: speech.dok_id ? `/docs?q=${speech.dok_id}` : undefined,
          }))}
        />
      </CardContent>
    </Card>
  );
}

function StatsGrid({ detail }: { detail: PoliticianDetail }) {
  const s = detail.summary;
  const stats = [
    { label: "Documents", value: s?.documents_authored ?? 0 },
    { label: "Votes", value: s?.votes ?? 0 },
    { label: "Speeches", value: s?.speeches ?? 0 },
    { label: "Yes", value: s?.yes_votes ?? 0 },
    { label: "No", value: s?.no_votes ?? 0 },
    { label: "Abstain", value: s?.abstain_votes ?? 0 },
    { label: "Sessions", value: s?.parliamentary_sessions_active ?? 0 },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border bg-card/50 p-3">
          <div className="text-xs text-muted-foreground">{stat.label}</div>
          <div className="text-lg font-semibold">{stat.value.toLocaleString()}</div>
        </div>
      ))}
      <div className="rounded-lg border bg-card/50 p-3 col-span-2 md:col-span-3">
        <div className="text-xs text-muted-foreground">Activity window</div>
        <div className="text-sm text-foreground">
          {formatDate(s?.first_activity_date)} — {formatDate(s?.last_activity_date)}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  emptyLabel,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  emptyLabel: string;
  items: ActivityItem[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {icon}
        <span>{title}</span>
      </div>
      <ActivityList items={items} emptyLabel={emptyLabel} />
    </div>
  );
}

type ActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  href?: string;
  badge?: string;
};

function ActivityList({ items, emptyLabel }: { items: ActivityItem[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <div className="text-sm text-muted-foreground">{emptyLabel}</div>;
  }

  return (
    <div className="space-y-2">
      <ItemGroup className="space-y-2">
        {items.map((item, idx) => (
          <Item key={`${item.id}-${idx}`} variant="muted" className="justify-between">
            <ItemContent>
              <ItemTitle className="text-sm text-foreground break-words">{item.title}</ItemTitle>
              <ItemDescription className="break-words">{item.subtitle}</ItemDescription>
            </ItemContent>
            <div className="flex items-center gap-2">
              {item.badge ? <Badge variant="outline">{item.badge}</Badge> : null}
              {item.href ? (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 text-primary text-xs hover:underline"
                >
                  Open
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              ) : null}
            </div>
          </Item>
        ))}
      </ItemGroup>
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "–";
  try {
    return new Date(value).toLocaleDateString("sv-SE");
  } catch {
    return value;
  }
}

function deriveActivityStatus(lastActivity: string | null | undefined): string {
  if (!lastActivity) return "Inactive";
  const last = new Date(lastActivity).getTime();
  if (Number.isNaN(last)) return "Inactive";
  const now = Date.now();
  const days = (now - last) / (1000 * 60 * 60 * 24);
  if (days <= 30) return "Active (30d)";
  if (days <= 90) return "Active (90d)";
  if (days <= 365) return "Active (1y)";
  return "Inactive";
}
