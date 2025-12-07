import { useQuery } from "@tanstack/react-query";
import { fetchEngagementLeaderboard } from "../api/engagementApi";
import type { EngagementRow } from "../api/types";

export function useEngagementLeaderboard(params: {
  window_days?: number;
  limit?: number;
  enabled?: boolean;
}) {
  const { enabled = true, ...rest } = params;
  return useQuery<EngagementRow[]>({
    queryKey: ["engagement", rest],
    queryFn: () => fetchEngagementLeaderboard(rest),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

