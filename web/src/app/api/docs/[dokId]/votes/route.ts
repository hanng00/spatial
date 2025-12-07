import { MotherDuckClient } from "@/lib/motherduck";
import { NextResponse } from "next/server";

type Params = {
  dokId: string;
};

const DEFAULT_LIMIT = 1000;

export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> }
) {
  const { dokId } = await params;
  if (!dokId) {
    return NextResponse.json({ error: "dokId required" }, { status: 400 });
  }

  const safeId = dokId.replace(/'/g, "''");

  const sql = `
    select
      votering_id,
      dok_id,
      parliamentary_session,
      beteckning,
      punkt,
      vote_description,
      vote_subject,
      intressent_id,
      party,
      vote_choice,
      vote_timestamp
    from main_mart.mart_votes_on_documents
    where dok_id = '${safeId}'
    order by vote_timestamp desc
    limit ${DEFAULT_LIMIT}
  `;

  try {
    const client = await MotherDuckClient.createInstance();
    const result = await client.execute(sql);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching document votes:", error);
    return NextResponse.json(
      { error: "Failed to fetch document votes" },
      { status: 500 }
    );
  }
}

