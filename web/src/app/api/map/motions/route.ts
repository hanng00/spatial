import { ColumnarResult, MotherDuckClient } from "@/lib/motherduck";
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

  // If no token, return mock data (for development)
  if (!process.env.MOTHERDUCK_ACCESS_TOKEN) {
    console.warn("MOTHERDUCK_ACCESS_TOKEN not set, returning mock data");
    return NextResponse.json({
      ...getMockMotions(district),
      _mock: true,
    });
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
        AND document_type IN ('mot', 'motion')
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

    // Return mock data on error (helpful for development)
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        ...getMockMotions(district),
        _mock: true,
        _error: String(error),
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch motions data" },
      { status: 500 }
    );
  }
}

/**
 * Mock data for development/fallback (column-oriented format)
 */
function getMockMotions(district: string): ColumnarResult {
  return {
    schema: {
      columns: [
        "dok_id",
        "document_title",
        "document_date",
        "document_type",
        "committee",
        "party",
        "intressent_id",
        "role",
        "parliamentary_session",
      ],
      dtypes: [
        "string",
        "string",
        "string",
        "string",
        "string",
        "string",
        "string",
        "string",
        "string",
      ],
    },
    data: {
      dok_id: ["H8023456", "H8023457", "H8023458", "H8023459", "H8023460"],
      document_title: [
        `Motion om förbättrad kollektivtrafik i ${district}`,
        "Motion om ökade resurser till vården",
        "Motion om klimatanpassning av jordbruket",
        "Motion om stärkt försvar och beredskap",
        "Motion om utbildningssatsningar i glesbygd",
      ],
      document_date: [
        "2025-01-15",
        "2025-01-12",
        "2025-01-10",
        "2025-01-08",
        "2025-01-05",
      ],
      document_type: ["motion", "motion", "motion", "motion", "motion"],
      committee: [
        "Trafikutskottet",
        "Socialutskottet",
        "Miljö- och jordbruksutskottet",
        "Försvarsutskottet",
        "Utbildningsutskottet",
      ],
      party: ["S", "M", "MP", "SD", "C"],
      intressent_id: ["123456", "234567", "345678", "456789", "567890"],
      role: ["Författare", "Författare", "Författare", "Författare", "Författare"],
      parliamentary_session: [
        "2024/25",
        "2024/25",
        "2024/25",
        "2024/25",
        "2024/25",
      ],
    },
  };
}

function parseNumericParam(value: string | null, fallback?: number) {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

