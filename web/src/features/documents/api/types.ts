export type DocumentSearchResult = {
  dok_id: string;
  document_title: string | null;
  derived_doc_type: string | null;
  rm: string | null;
  committee: string | null;
  document_date: string | null;
  outgoing_edges: number | null;
  incoming_edges: number | null;
  derived_outcome: string | null;
  vote_rows: number | null;
  topic: string | null;
};

export type DocumentDetail = {
  dok_id: string;
  document_title: string | null;
  document_date: string | null;
  derived_doc_type: string | null;
  rm: string | null;
  committee: string | null;
  outgoing_edges: number | null;
  incoming_edges: number | null;
  derived_outcome: string | null;
  vote_rows: number | null;
  topic: string | null;
};

export type DocumentEdge = {
  relation_type: string;
  relation_subtype: string | null;
  source_id: string | null;
  target_id: string | null;
  intressent_id: string | null;
  vote_choice: string | null;
  parliamentary_session: string | null;
};

export type DocumentGraphResponse = {
  edges_json: unknown[];
  nodes_json: unknown[];
};

export type DocumentGeographyPoint = {
  dok_id: string;
  document_date: string | null;
  document_year: number | null;
  document_month: number | null;
  document_title: string | null;
  document_type: string | null;
  document_category: string | null;
  committee: string | null;
  parliamentary_session: string | null;
  intressent_id: string | null;
  role: string | null;
  electoral_district: string | null;
  party: string | null;
  explicit_location: string | null;
};

export type DocumentVote = {
  votering_id: string;
  dok_id: string;
  parliamentary_session: string | null;
  beteckning: string | null;
  punkt: string | null;
  vote_description: string | null;
  vote_subject: string | null;
  intressent_id: string | null;
  party: string | null;
  vote_choice: string | null;
  vote_timestamp: string | null;
};

