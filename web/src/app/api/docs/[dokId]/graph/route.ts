import { MotherDuckClient } from "@/lib/motherduck";
import { NextResponse } from "next/server";

type Params = {
  dokId: string;
};

const MAX_EDGES = 500;

export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> }
) {
  const { dokId } = await params;
  if (!dokId) {
    return NextResponse.json({ error: "dokId required" }, { status: 400 });
  }

  const safeId = dokId.replace(/'/g, "''");

  const edgeSql = `
    with edges as (
      select *
      from main_mart.mart_document_edges
      where source_id = '${safeId}' or target_id = '${safeId}'
      limit ${MAX_EDGES}
    ),
    node_ids as (
      select source_id as id from edges
      union
      select target_id as id from edges
      union
      select '${safeId}' as id
    )
    select
      json_group_array(edges) as edges_json,
      (
        select json_group_array(
          json_object(
            'dok_id', g.dok_id,
            'document_title', g.document_title,
            'derived_doc_type', g.derived_doc_type,
            'rm', g.rm,
            'committee', g.committee,
            'document_date', g.document_date,
            'outgoing_edges', g.outgoing_edges,
            'incoming_edges', g.incoming_edges
          )
        )
        from main_mart.mart_document_graph g
        join node_ids n on g.dok_id = n.id
      ) as nodes_json
    from edges;
  `;

  try {
    const client = await MotherDuckClient.createInstance();
    const result = await client.execute(edgeSql);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching document graph:", error);
    return NextResponse.json(
      { error: "Failed to fetch document graph" },
      { status: 500 }
    );
  }
}

