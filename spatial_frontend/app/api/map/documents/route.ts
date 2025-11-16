import { NextResponse } from 'next/server'

/**
 * API route to fetch document geography data from MotherDuck
 * Returns aggregated document counts by electoral district
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const year = searchParams.get('year')
  const month = searchParams.get('month')

  try {
    // For now, return mock data structure
    // TODO: Connect to MotherDuck and query mart_document_geography
    // const token = process.env.MOTHERDUCK_ACCESS_TOKEN
    // const conn = duckdb.connect(`md:spatial_dagster?motherduck_token=${token}`)
    // const data = await conn.execute(`
    //   SELECT * FROM main_mart.mart_document_geography
    //   WHERE document_year = ${year || '2025'}
    //   ${month ? `AND document_month = ${month}` : ''}
    // `)

    // Mock data structure matching mart_document_geography schema
    const mockData = [
      {
        electoral_district: 'Stockholms kommun',
        document_year: 2025,
        document_month: 1,
        document_count: 45,
        politician_count: 12,
        party_count: 5,
        question_count: 20,
        proposition_count: 10,
        report_count: 8,
        motion_count: 7,
      },
      {
        electoral_district: 'Göteborgs kommun',
        document_year: 2025,
        document_month: 1,
        document_count: 32,
        politician_count: 8,
        party_count: 4,
        question_count: 15,
        proposition_count: 8,
        report_count: 5,
        motion_count: 4,
      },
    ]

    return NextResponse.json({
      data: mockData,
      filters: { year: year || '2025', month: month || null },
    })
  } catch (error) {
    console.error('Error fetching document geography:', error)
    return NextResponse.json(
      { error: 'Failed to fetch document geography data' },
      { status: 500 }
    )
  }
}

