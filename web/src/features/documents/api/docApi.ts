import { columnarToRows, type ColumnarResponse } from "@/lib/columnar";
import type {
  DocumentDetail,
  DocumentEdge,
  DocumentGeographyPoint,
  DocumentGraphResponse,
  DocumentSearchResult,
  DocumentVote,
} from "./types";

type SearchParams = {
  q?: string;
  type?: string;
  rm?: string;
  topic?: string;
  committee?: string;
  limit?: number;
  offset?: number;
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  return search.toString();
}

export async function fetchDocumentSearch(
  params: SearchParams
): Promise<DocumentSearchResult[]> {
  const qs = buildQuery(params);
  const res = await fetch(`/api/docs/search?${qs}`);
  if (!res.ok) throw new Error("Failed to search documents");
  const data: ColumnarResponse = await res.json();
  return columnarToRows<DocumentSearchResult>(data);
}

export async function fetchDocumentDetail(
  dokId: string
): Promise<DocumentDetail | null> {
  const res = await fetch(`/api/docs/${dokId}/detail`);
  if (!res.ok) throw new Error("Failed to fetch document detail");
  const data: ColumnarResponse = await res.json();
  const rows = columnarToRows<DocumentDetail>(data);
  return rows[0] ?? null;
}

export async function fetchDocumentGraph(
  dokId: string
): Promise<{ edges: DocumentEdge[]; nodes: Record<string, unknown>[] }> {
  const res = await fetch(`/api/docs/${dokId}/graph`);
  if (!res.ok) throw new Error("Failed to fetch document graph");
  const data = (await res.json()) as ColumnarResponse;
  // graph endpoint returns two json arrays as columns
  const rows = columnarToRows<DocumentGraphResponse>(data);
  const first = rows[0];
  const parseJsonArray = <T>(value: unknown): T[] => {
    if (Array.isArray(value)) return value as T[];
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? (parsed as T[]) : [];
      } catch {
        return [];
      }
    }
    return [];
  };
  return {
    edges: parseJsonArray<DocumentEdge>(first?.edges_json),
    nodes: parseJsonArray<Record<string, unknown>>(first?.nodes_json),
  };
}

export async function fetchDocumentGeography(
  dokId: string
): Promise<DocumentGeographyPoint[]> {
  const res = await fetch(`/api/docs/${dokId}/geography`);
  if (!res.ok) throw new Error("Failed to fetch document geography");
  const data: ColumnarResponse = await res.json();
  return columnarToRows<DocumentGeographyPoint>(data);
}

export async function fetchDocumentVotes(
  dokId: string
): Promise<DocumentVote[]> {
  const res = await fetch(`/api/docs/${dokId}/votes`);
  if (!res.ok) throw new Error("Failed to fetch document votes");
  const data: ColumnarResponse = await res.json();
  return columnarToRows<DocumentVote>(data);
}
