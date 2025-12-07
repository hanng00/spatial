import { useQuery } from "@tanstack/react-query";
import { fetchPoliticianActivityDetail } from "../api/politicianActivityApi";

export function usePoliticianActivity(intressentId: string | null) {
  return useQuery({
    queryKey: ["politician-activity", intressentId],
    queryFn: () => fetchPoliticianActivityDetail(intressentId as string),
    enabled: !!intressentId,
    staleTime: 1000 * 60 * 5,
  });
}

