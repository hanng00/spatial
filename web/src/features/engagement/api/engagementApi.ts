import { columnarToRows, type ColumnarResponse } from "@/lib/columnar";
import type { EngagementRow } from "./types";

export async function fetchEngagementLeaderboard(params: {
  window_days?: number;
  limit?: number;
}): Promise<EngagementRow[]> {
  const search = new URLSearchParams();
  if (params.window_days) search.set("window_days", params.window_days.toString());
  if (params.limit) search.set("limit", params.limit.toString());
  const qs = search.toString();
  const res = await fetch(`/api/engagement/leaderboard${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch engagement leaderboard");
  const data: ColumnarResponse = await res.json();
  return columnarToRows<EngagementRow>(data);
}

