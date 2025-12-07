import { MotherDuckClient } from "@/lib/motherduck";
import { NextResponse } from "next/server";

type SearchParams = {
  q?: string | null;
  type?: string | null;
  rm?: string | null;
  topic?: string | null;
  committee?: string | null;
  limit?: string | null;
  offset?: string | null;
};

const DEFAULT_LIMIT = 50;
const DEFAULT_OFFSET = 0;

function parseLimit(raw: string | null | undefined): number {
  if (!raw) return DEFAULT_LIMIT;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
  return Math.min(n, 200);
}

function parseOffset(raw: string | null | undefined): number {
  if (!raw) return DEFAULT_OFFSET;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return DEFAULT_OFFSET;
  return n;
}

function escape(value: string): string {
  return value.replace(/'/g, "''");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params: SearchParams = {
    q: searchParams.get("q"),
    type: searchParams.get("type"),
    rm: searchParams.get("rm"),
    topic: searchParams.get("topic"),
    committee: searchParams.get("committee"),
    limit: searchParams.get("limit"),
    offset: searchParams.get("offset"),
  };

  const limit = parseLimit(params.limit);
  const offset = parseOffset(params.offset);

  const filters: string[] = [];
  if (params.q) {
    const q = escape(params.q);
    filters.push(
      `(document_title ILIKE '%${q}%' OR coalesce(committee,'') ILIKE '%${q}%')`
    );
  }
  if (params.type) filters.push(`derived_doc_type = '${escape(params.type)}'`);
  if (params.rm) filters.push(`rm = '${escape(params.rm)}'`);
  if (params.committee)
    filters.push(`committee ILIKE '%${escape(params.committee)}%'`);
  if (params.topic)
    filters.push(
      `mg.dok_id in (select dok_id from main_mart.mart_document_topics where topic = '${escape(
        params.topic
      )}')`
    );

  const whereClause = filters.length ? `where ${filters.join(" and ")}` : "";

  const sql = `
    select
      mg.dok_id,
      mg.document_title,
      mg.derived_doc_type,
      mg.rm,
      mg.committee,
      mg.document_date,
      mg.outgoing_edges,
      mg.incoming_edges,
      mo.derived_outcome,
      mo.vote_rows,
      mt.topic
    from main_mart.mart_document_graph mg
    left join main_mart.mart_document_outcomes mo on mg.dok_id = mo.dok_id
    left join main_mart.mart_document_topics mt on mg.dok_id = mt.dok_id
    ${whereClause}
    order by coalesce(mg.document_date, '9999-12-31') desc
    limit ${limit}
    offset ${offset};
  `;

  try {
    const client = await MotherDuckClient.createInstance();
    const result = await client.execute(sql);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error searching documents:", error);
    return NextResponse.json(
      { error: "Failed to search documents" },
      { status: 500 }
    );
  }
}

