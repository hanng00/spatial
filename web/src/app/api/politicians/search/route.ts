import { MotherDuckClient } from "@/lib/motherduck";
import { NextResponse } from "next/server";

function parseLimit(raw: string | null | undefined, fallback: number) {
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(n, 50);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const limit = parseLimit(searchParams.get("limit"), 20);

  const safeQuery = q ? q.trim().replace(/'/g, "''") : null;
  const hasQuery = Boolean(safeQuery && safeQuery.length > 0);

  const filterClause = hasQuery
    ? `where display_name like '%${safeQuery}%'`
    : "";

  const sql = `
    with base as (
      select
        intressent_id,
        coalesce(display_name, intressent_id) as display_name,
        party,
        electoral_district,
        coalesce(total_documents, 0) as documents_authored,
        coalesce(total_speeches, 0) as speeches,
        coalesce(total_votes, 0) as votes,
        first_touchpoint_date::timestamp as first_activity_date,
        last_touchpoint_date::timestamp as last_activity_date
      from spatial_dagster.main_mart.mart_politician360
      ${filterClause}
      order by coalesce(last_touchpoint_date::timestamp, timestamp '1900-01-01') desc nulls last, display_name
      limit ${limit}
    )
    select *
    from base;
  `;

  try {
    const client = await MotherDuckClient.createInstance();
    const result = await client.execute(sql);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error searching politicians:", error);
    return NextResponse.json(
      { error: "Failed to search politicians" },
      { status: 500 }
    );
  }
}

