import { columnarToRows, type ColumnarResponse } from "@/lib/columnar";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
    politicianDocumentSchema,
    politicianSearchResultSchema,
    politicianSpeechSchema,
    politicianSummarySchema,
    politicianVoteSchema,
    type PoliticianDetail,
    type PoliticianSearchResult,
} from "./types";

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function parseArray<T>(value: unknown, schema: z.ZodType<T>): T[] {
  if (!value) return [];

  const attemptParse = (raw: unknown) => {
    const parsed = schema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  };

  if (Array.isArray(value)) {
    return value.map(attemptParse).filter(Boolean) as T[];
  }

  if (typeof value === "string") {
    try {
      const jsonValue = JSON.parse(value);
      if (Array.isArray(jsonValue)) {
        return jsonValue.map(attemptParse).filter(Boolean) as T[];
      }
    } catch {
      return [];
    }
  }

  return [];
}

export async function searchPoliticians(params: {
  query?: string;
  limit?: number;
}): Promise<PoliticianSearchResult[]> {
  const normalizedQuery = (params.query ?? "").trim();
  const qs = buildQuery({ q: normalizedQuery, limit: params.limit });
  const res = await fetch(`/api/politicians/search${qs}`);
  if (!res.ok) {
    throw new Error("Failed to search politicians");
  }
  const data: ColumnarResponse = await res.json();
  const rows = columnarToRows<PoliticianSearchResult>(data);
  return rows
    .map((row) => politicianSearchResultSchema.safeParse(row))
    .filter((result): result is z.SafeParseSuccess<PoliticianSearchResult> => result.success)
    .map((result) => result.data);
}

type ActivityRow = {
  summary?: unknown;
  docs?: unknown;
  votes?: unknown;
  speeches?: unknown;
};

export async function fetchPoliticianDetail(
  intressentId: string,
  options?: { limit?: number }
): Promise<PoliticianDetail | null> {
  const qs = buildQuery({ limit: options?.limit ?? 50 });
  const res = await fetch(`/api/politicians/${intressentId}/activity${qs}`);
  if (!res.ok) {
    throw new Error("Failed to fetch politician activity");
  }

  const data: ColumnarResponse = await res.json();
  const [row] = columnarToRows<ActivityRow>(data);
  if (!row) return null;

  const summaryRaw = Array.isArray(row.summary) ? row.summary[0] : null;
  const summaryParse = summaryRaw
    ? politicianSummarySchema.safeParse(summaryRaw)
    : null;
  const summary =
    summaryParse && summaryParse.success ? summaryParse.data : null;

  return {
    summary,
    documents: parseArray(row.docs, politicianDocumentSchema),
    votes: parseArray(row.votes, politicianVoteSchema),
    speeches: parseArray(row.speeches, politicianSpeechSchema),
  };
}

export function usePoliticianSearch(params: {
  query: string;
  limit?: number;
  enabled?: boolean;
  minQueryLength?: number;
}) {
  const {
    query,
    limit = 20,
    enabled = true,
    minQueryLength = 0,
  } = params;
  const normalizedQuery = query.trim();
  return useQuery<PoliticianSearchResult[]>({
    queryKey: ["politician-search", normalizedQuery, limit],
    queryFn: () => searchPoliticians({ query: normalizedQuery, limit }),
    enabled: enabled && normalizedQuery.length >= minQueryLength,
    staleTime: 1000 * 60 * 5,
  });
}

export function usePoliticianDetail(
  intressentId: string | null,
  options?: { limit?: number }
) {
  return useQuery<PoliticianDetail | null>({
    queryKey: ["politician-detail", intressentId, options?.limit],
    queryFn: () => fetchPoliticianDetail(intressentId as string, options),
    enabled: Boolean(intressentId),
    staleTime: 1000 * 60 * 5,
  });
}
