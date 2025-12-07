export type GraphNodeKind = "document" | "person";

export type GraphNode = {
  id: string;
  kind: GraphNodeKind;
  label: string;
  type?: string | null;
  rm?: string | null;
  committee?: string | null;
  document_date?: string | null;
  outgoing_edges?: number | null;
  incoming_edges?: number | null;
  party?: string | null;
  district?: string | null;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  relation_type: "reference" | "person_involved" | "speech" | "vote";
  relation_subtype?: string | null;
  vote_choice?: string | null;
  parliamentary_session?: string | null;
  timestamp?: string | null;
};

export type GraphPage = {
  limit: number;
  offset: number;
  total?: number | null;
};

export type GraphResponse = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  page: GraphPage;
};

