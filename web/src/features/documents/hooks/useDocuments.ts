import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  fetchDocumentDetail,
  fetchDocumentGeography,
  fetchDocumentGraph,
  fetchDocumentSearch,
  fetchDocumentVotes,
} from "../api/docApi";
import type {
  DocumentDetail,
  DocumentEdge,
  DocumentGeographyPoint,
  DocumentSearchResult,
  DocumentVote,
} from "../api/types";

export function useDocumentSearch(params: {
  q?: string;
  type?: string;
  rm?: string;
  topic?: string;
  committee?: string;
  limit?: number;
  enabled?: boolean;
}) {
  const { enabled = true, limit = 50, ...rest } = params;
  return useInfiniteQuery<DocumentSearchResult[]>({
    queryKey: ["docs-search", rest, limit],
    queryFn: ({ pageParam = 0 }) =>
      fetchDocumentSearch({
        ...rest,
        limit,
        offset: pageParam as number,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (!lastPage || lastPage.length < limit) return undefined;
      return (lastPageParam as number) + limit;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

export function useDocumentDetail(dokId: string | null) {
  return useQuery<DocumentDetail | null>({
    queryKey: ["doc-detail", dokId],
    queryFn: () => fetchDocumentDetail(dokId as string),
    enabled: !!dokId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useDocumentGraph(dokId: string | null) {
  return useQuery<{ edges: DocumentEdge[]; nodes: Record<string, unknown>[] }>({
    queryKey: ["doc-graph", dokId],
    queryFn: () => fetchDocumentGraph(dokId as string),
    enabled: !!dokId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useDocumentGeography(dokId: string | null) {
  return useQuery<DocumentGeographyPoint[]>({
    queryKey: ["doc-geo", dokId],
    queryFn: () => fetchDocumentGeography(dokId as string),
    enabled: !!dokId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useDocumentVotes(dokId: string | null) {
  return useQuery<DocumentVote[]>({
    queryKey: ["doc-votes", dokId],
    queryFn: () => fetchDocumentVotes(dokId as string),
    enabled: !!dokId,
    staleTime: 1000 * 60 * 5,
  });
}

