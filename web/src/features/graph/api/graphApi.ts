import type { GraphResponse } from "../types";

type GraphRequest = {
  id: string;
  relationTypes?: string[];
  start?: string | null;
  end?: string | null;
  limit?: number;
  offset?: number;
};

function buildQuery(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  return search.toString();
}

export async function fetchGraphNetwork(params: GraphRequest): Promise<GraphResponse> {
  const { id, relationTypes = [], start, end, limit, offset } = params;
  const qs = buildQuery({
    id,
    relationTypes: relationTypes.length ? relationTypes.join(",") : undefined,
    start,
    end,
    limit,
    offset,
  });
  const res = await fetch(`/api/graph?${qs}`);
  if (!res.ok) {
    throw new Error("Failed to fetch graph");
  }
  return (await res.json()) as GraphResponse;
}

