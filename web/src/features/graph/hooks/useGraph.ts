import { useQuery } from "@tanstack/react-query";
import { fetchGraphNetwork } from "../api/graphApi";
import type { GraphResponse } from "../types";

type UseGraphParams = {
  id: string | null;
  relationTypes?: string[];
  start?: string | null;
  end?: string | null;
  limit?: number;
  offset?: number;
};

export function useGraph(params: UseGraphParams) {
  const { id, relationTypes, start, end, limit, offset } = params;
  return useQuery<GraphResponse>({
    queryKey: ["graph", id, relationTypes, start, end, limit, offset],
    queryFn: () =>
      fetchGraphNetwork({
        id: id as string,
        relationTypes,
        start,
        end,
        limit,
        offset,
      }),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

