import { columnarToRows } from "@/lib/columnar";
import { MotherDuckClient } from "@/lib/motherduck";
import { NextResponse } from "next/server";

type Params = {
  focusId?: string | null;
  start?: string | null;
  end?: string | null;
  relationTypes?: string | null;
  limit?: string | null;
  offset?: string | null;
};

const DEFAULT_LIMIT = 300;
const MAX_LIMIT = 800;
const DEFAULT_OFFSET = 0;
const ALLOWED_RELATIONS = ["reference", "person_involved", "speech", "vote"] as const;

function escapeLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

function parseLimit(raw: string | null | undefined): number {
  if (!raw) return DEFAULT_LIMIT;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
  return Math.min(n, MAX_LIMIT);
}

function parseOffset(raw: string | null | undefined): number {
  if (!raw) return DEFAULT_OFFSET;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return DEFAULT_OFFSET;
  return n;
}

function parseRelationTypes(raw: string | null): string[] {
  if (!raw) return [...ALLOWED_RELATIONS];
  const requested = raw
    .split(",")
    .map((t) => t.trim())
    .filter((t) => ALLOWED_RELATIONS.includes(t as (typeof ALLOWED_RELATIONS)[number]));
  return requested.length > 0 ? requested : [...ALLOWED_RELATIONS];
}

function parseDate(raw: string | null): string | null {
  if (!raw) return null;
  // Simple YYYY-MM-DD validation to avoid SQL injection via date params
  return /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw : null;
}

function parseJsonArray<T>(value: unknown): T[] {
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
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params: Params = {
    focusId: searchParams.get("id"),
    start: searchParams.get("start"),
    end: searchParams.get("end"),
    relationTypes: searchParams.get("relationTypes"),
    limit: searchParams.get("limit"),
    offset: searchParams.get("offset"),
  };

  if (!params.focusId || params.focusId.trim() === "") {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const focusId = escapeLiteral(params.focusId.trim());
  const limit = parseLimit(params.limit);
  const offset = parseOffset(params.offset);
  const relations = parseRelationTypes(params.relationTypes);
  const start = parseDate(params.start);
  const end = parseDate(params.end);

  const relationList = relations.map((t) => `'${t}'`).join(", ");
  const timeFilters: string[] = [];
  if (start) timeFilters.push(`timestamp >= '${escapeLiteral(start)}'`);
  if (end) timeFilters.push(`timestamp <= '${escapeLiteral(end)}'`);
  const timeClause = timeFilters.length ? `and ${timeFilters.join(" and ")}` : "";

  const sql = `
    with edges_raw as (
      select
        source_id,
        target_id,
        relation_type,
        relation_subtype,
        intressent_id,
        vote_choice,
        parliamentary_session,
        timestamp,
        count(*) over () as total_edges
      from main_mart.mart_document_edges
      where (source_id = '${focusId}' or target_id = '${focusId}' or intressent_id = '${focusId}')
        and relation_type in (${relationList})
        ${timeClause}
      order by coalesce(timestamp, '1900-01-01') desc, source_id, target_id
      limit ${limit}
      offset ${offset}
    ),
    edges as (
      select
        source_id,
        target_id,
        relation_type,
        relation_subtype,
        intressent_id,
        vote_choice,
        parliamentary_session,
        timestamp,
        total_edges,
        case
          when relation_type = 'reference' then source_id
          when relation_type = 'person_involved' then source_id
          when relation_type in ('speech', 'vote') then intressent_id
          else source_id
        end as from_id,
        case
          when relation_type = 'reference' then target_id
          when relation_type = 'person_involved' then intressent_id
          when relation_type in ('speech', 'vote') then target_id
          else target_id
        end as to_id
      from edges_raw
    ),
    filtered_edges as (
      select *
      from edges
      where from_id is not null and to_id is not null
    ),
    doc_nodes as (
      select distinct
        g.dok_id,
        g.document_title,
        g.derived_doc_type,
        g.rm,
        g.committee,
        g.document_date,
        g.outgoing_edges,
        g.incoming_edges
      from main_mart.mart_document_graph g
      join (
        select from_id as id from filtered_edges where relation_type in ('reference', 'person_involved')
        union
        select to_id from filtered_edges
        union
        select '${focusId}' as id
      ) ids on ids.id = g.dok_id
    ),
    person_nodes as (
      select distinct
        p.intressent_id,
        p.display_name,
        p.party_clean,
        p.electoral_district
      from main_int.int_politicians p
      join (
        select intressent_id as id from filtered_edges where intressent_id is not null
        union
        select '${focusId}' as id
      ) ids on ids.id = p.intressent_id
    )
    select
      coalesce(max(total_edges), 0) as total_edges,
      json_group_array(
        json_object(
          'id', coalesce(relation_type, '') || ':' || coalesce(from_id, '') || '>' || coalesce(to_id, ''),
          'source', from_id,
          'target', to_id,
          'relation_type', relation_type,
          'relation_subtype', relation_subtype,
          'vote_choice', vote_choice,
          'parliamentary_session', parliamentary_session,
          'timestamp', timestamp
        )
      ) as edges_json,
      (
        select json_group_array(
          json_object(
            'id', dok_id,
            'kind', 'document',
            'label', coalesce(document_title, dok_id),
            'type', derived_doc_type,
            'rm', rm,
            'committee', committee,
            'document_date', document_date,
            'outgoing_edges', outgoing_edges,
            'incoming_edges', incoming_edges
          )
        )
        from doc_nodes
      ) as doc_nodes_json,
      (
        select json_group_array(
          json_object(
            'id', intressent_id,
            'kind', 'person',
            'label', coalesce(display_name, intressent_id),
            'party', party_clean,
            'district', electoral_district
          )
        )
        from person_nodes
      ) as person_nodes_json
    from filtered_edges;
  `;

  try {
    const client = await MotherDuckClient.createInstance();
    const result = await client.execute(sql);
    const rows = columnarToRows<{
      edges_json: unknown;
      doc_nodes_json: unknown;
      person_nodes_json: unknown;
      total_edges: number | null;
    }>(result);
    const first = rows[0];
    const edges = parseJsonArray(first?.edges_json);
    const docNodes = parseJsonArray(first?.doc_nodes_json);
    const personNodes = parseJsonArray(first?.person_nodes_json);
    return NextResponse.json({
      edges,
      nodes: [...docNodes, ...personNodes],
      page: {
        limit,
        offset,
        total: first?.total_edges ?? edges.length ?? 0,
      },
    });
  } catch (error) {
    console.error("Error fetching graph:", error);
    return NextResponse.json({ error: "Failed to fetch graph" }, { status: 500 });
  }
}

