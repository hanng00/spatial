import { MotherDuckClient, type ColumnarResult } from "@/lib/motherduck";
import { NextResponse } from "next/server";

/**
 * API route to fetch document geography data from MotherDuck
 * Returns aggregated document counts by electoral district in column-oriented format
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = parseNumericParam(searchParams.get("year"), new Date().getFullYear());
  const month = parseNumericParam(searchParams.get("month"));
  const limit = parseNumericParam(searchParams.get("limit"), 200);

  // If no token, return mock data (for development)
  if (!process.env.MOTHERDUCK_ACCESS_TOKEN) {
    console.warn("MOTHERDUCK_ACCESS_TOKEN not set, returning mock document geography data");
    return NextResponse.json({
      ...getMockDocumentGeography(year, month),
      _mock: true,
    });
  }

  try {
    const client = await MotherDuckClient.createInstance();

    // Build query with safe numeric filters and cleaned districts
    const monthFilter = month ? `AND document_month = ${month}` : "";
    const query = `
      WITH filtered AS (
        SELECT
          electoral_district,
          document_year,
          document_month,
          document_type,
          dok_id,
          intressent_id,
          party
        FROM main_int.int_document_geography
        WHERE document_year = ${year}
          ${monthFilter}
          AND electoral_district IS NOT NULL
          AND trim(electoral_district) <> ''
      )
      SELECT 
        electoral_district,
        document_year,
        document_month,
        COUNT(DISTINCT dok_id) AS document_count,
        COUNT(DISTINCT intressent_id) AS politician_count,
        COUNT(DISTINCT party) AS party_count,
        COUNT(DISTINCT CASE WHEN document_type = 'fr' THEN dok_id END) AS question_count,
        COUNT(DISTINCT CASE WHEN document_type = 'prop' THEN dok_id END) AS proposition_count,
        COUNT(DISTINCT CASE WHEN document_type = 'bet' THEN dok_id END) AS report_count,
        COUNT(DISTINCT CASE WHEN document_type IN ('mot', 'motion') THEN dok_id END) AS motion_count
      FROM filtered
      GROUP BY 1,2,3
      ORDER BY document_count DESC
      LIMIT ${limit};
    `;
    const result = await client.execute(query);

    // Return column-oriented JSON for size/speed optimization
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching document geography:", error);

    // Return mock data on error (helpful for development)
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        ...getMockDocumentGeography(year, month),
        _mock: true,
        _error: String(error),
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch document geography data" },
      { status: 500 }
    );
  }
}

function parseNumericParam(value: string | null, fallback?: number) {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getMockDocumentGeography(
  year: number,
  month?: number
): ColumnarResult {
  const schema = {
    columns: [
      "electoral_district",
      "document_year",
      "document_month",
      "document_count",
      "politician_count",
      "party_count",
      "question_count",
      "proposition_count",
      "report_count",
      "motion_count",
    ],
    dtypes: [
      "string",
      "integer",
      "integer",
      "integer",
      "integer",
      "integer",
      "integer",
      "integer",
      "integer",
      "integer",
    ],
  };

  const mockRows = [
    {
      electoral_district: "Stockholms kommun",
      document_year: year,
      document_month: month ?? 1,
      document_count: 120,
      politician_count: 32,
      party_count: 8,
      question_count: 35,
      proposition_count: 6,
      report_count: 4,
      motion_count: 75,
    },
    {
      electoral_district: "Göteborgs kommun",
      document_year: year,
      document_month: month ?? 1,
      document_count: 68,
      politician_count: 18,
      party_count: 7,
      question_count: 20,
      proposition_count: 2,
      report_count: 1,
      motion_count: 40,
    },
    {
      electoral_district: "Skåne läns norra och östra",
      document_year: year,
      document_month: month ?? 1,
      document_count: 54,
      politician_count: 14,
      party_count: 6,
      question_count: 12,
      proposition_count: 1,
      report_count: 0,
      motion_count: 30,
    },
  ];

  const data = schema.columns.reduce<Record<string, (string | number)[]>>(
    (acc, column) => {
      acc[column] = mockRows.map((row) => row[column as keyof typeof row]);
      return acc;
    },
    {}
  );

  return { schema, data };
}
