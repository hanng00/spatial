import { MotherDuckClient } from "@/lib/motherduck";
import { NextResponse } from "next/server";

/**
 * API route to fetch motions for a specific electoral district
 * Returns individual motion documents in column-oriented format
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get("district");
  const year = parseNumericParam(
    searchParams.get("year"),
    new Date().getFullYear()
  );
  const month = parseNumericParam(searchParams.get("month"));
  const limit = parseNumericParam(searchParams.get("limit"), 50);

  if (!district) {
    return NextResponse.json(
      { error: "district parameter is required" },
      { status: 400 }
    );
  }

  try {
    const client = await MotherDuckClient.createInstance();

    // Build query with string interpolation (safe for known-format params)
    // document_type from Riksdagen API uses "mot" for motions; keep fallback "motion"
    const monthFilter = month ? `AND document_month = ${month}` : "";
    const query = `
      SELECT
        dok_id,
        any_value(document_title) AS document_title,
        max(document_date) AS document_date,
        any_value(document_type) AS document_type,
        string_agg(DISTINCT committee, ', ') AS committee,
        string_agg(DISTINCT party, ', ') AS party,
        string_agg(DISTINCT intressent_id, ', ') AS intressent_id,
        string_agg(DISTINCT role, ', ') AS role,
        any_value(parliamentary_session) AS parliamentary_session
      FROM main_int.int_document_geography
      WHERE electoral_district = '${district.replace(/'/g, "''")}'
        -- AND document_type IN ('mot', 'motion')
        AND document_year = ${year}
        ${monthFilter}
      GROUP BY dok_id
      ORDER BY document_date DESC
      LIMIT ${limit};
    `;

    const result = await client.execute(query);

    // Return column-oriented JSON for size/speed optimization
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching motions:", error);

    return NextResponse.json(
      { error: "Failed to fetch motions data" },
      { status: 500 }
    );
  }
}

function parseNumericParam(value: string | null, fallback?: number) {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}
