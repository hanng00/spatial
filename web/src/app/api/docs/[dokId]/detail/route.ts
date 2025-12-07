import { MotherDuckClient } from "@/lib/motherduck";
import { NextResponse } from "next/server";
type Params = {
  dokId: string;
};

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
      g.dok_id,
      g.document_title,
      g.document_date,
      g.derived_doc_type,
      g.rm,
      g.committee,
      g.outgoing_edges,
      g.incoming_edges,
      o.derived_outcome,
      o.vote_rows,
      t.topic
    from main_mart.mart_document_graph g
    left join main_mart.mart_document_outcomes o on g.dok_id = o.dok_id
    left join main_mart.mart_document_topics t on g.dok_id = t.dok_id
    where g.dok_id = '${safeId}'
  `;

  try {
    const client = await MotherDuckClient.createInstance();
    const result = await client.execute(sql);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching document detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch document detail" },
      { status: 500 }
    );
  }
}

