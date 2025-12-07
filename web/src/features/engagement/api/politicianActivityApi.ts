import { columnarToRows, type ColumnarResponse } from "@/lib/columnar";

export type PoliticianActivityDetail = {
  summary: Array<{
    intressent_id: string;
    party: string | null;
    electoral_district: string | null;
    documents_authored: number | null;
    speeches: number | null;
    votes: number | null;
    yes_votes: number | null;
    no_votes: number | null;
    abstain_votes: number | null;
    parliamentary_sessions_active: number | null;
    first_activity_date: string | null;
    last_activity_date: string | null;
    document_count: number | null;
    district_count: number | null;
    party_count: number | null;
    first_document_date: string | null;
    last_document_date: string | null;
  }>;
  docs: Array<{
    dok_id: string;
    document_title: string | null;
    document_date: string | null;
    derived_doc_type: string | null;
  }>;
  votes: Array<{
    dok_id: string;
    document_title: string | null;
    document_date: string | null;
    vote_choice: string | null;
    vote_description: string | null;
    vote_timestamp: string | null;
  }>;
  speeches: Array<{
    speech_id: string;
    dok_id: string;
    document_title: string | null;
    document_date: string | null;
    parliamentary_session: string | null;
    speech_timestamp: string | null;
  }>;
};

export async function fetchPoliticianActivityDetail(
  intressentId: string
): Promise<PoliticianActivityDetail | null> {
  const res = await fetch(`/api/politicians/${intressentId}/activity`);
  if (!res.ok) throw new Error("Failed to fetch politician activity");
  const data: ColumnarResponse = await res.json();
  const rows = columnarToRows<{
    summary: unknown;
    docs: unknown;
    votes: unknown;
    speeches: unknown;
  }>(data);
  const first = rows[0];
  if (!first) return null;
  return {
    summary: (first.summary as any[]) || [],
    docs: (first.docs as any[]) || [],
    votes: (first.votes as any[]) || [],
    speeches: (first.speeches as any[]) || [],
  };
}

