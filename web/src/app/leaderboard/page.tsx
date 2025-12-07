"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EngagementCard } from "@/features/engagement/components/EngagementCard";
import { useEngagementLeaderboard } from "@/features/engagement/hooks/useEngagement";
import Link from "next/link";
import { useState } from "react";

const defaultWindow = 7;

export default function LeaderboardPage() {
  const [windowDays, setWindowDays] = useState<number>(defaultWindow);
  const { data, isLoading, isError, refetch } = useEngagementLeaderboard({
    window_days: windowDays,
    limit: 3,
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <div className="p-6 flex flex-col gap-4 container mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Engagement Leaderboard</h1>
            <p className="text-sm text-muted-foreground">
              Vilka politiker är mest aktiva just nu? Dokument, röster,
              anföranden.
            </p>
          </div>
          <Link href="/docs" className="text-sm text-primary hover:underline">
            Öppna dokumentutforskaren
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">
              Tidsfönster (dagar)
            </label>
            <Input
              type="number"
              min={1}
              max={90}
              value={windowDays}
              onChange={(e) =>
                setWindowDays(Number(e.target.value) || defaultWindow)
              }
              className="w-28"
            />
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            Uppdatera
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Laddar...</div>
            ) : isError ? (
              <div className="text-destructive">
                Kunde inte ladda leaderboard
              </div>
            ) : (
              <ScrollArea className="h-[75vh] pr-4">
                <div className="space-y-3">
                  {(data || []).map((row, idx) => (
                    <EngagementCard
                      key={row.intressent_id}
                      rank={idx + 1}
                      row={row}
                      windowDays={windowDays}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
