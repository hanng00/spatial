import { MotherDuckClient } from "@/lib/motherduck";
import { NextResponse } from "next/server";

type Params = {
  intressentId: string;
};

export async function GET(
  _request: Request,
  { params }: { params: Params }
) {
  const intressentId = params.intressentId;
  if (!intressentId) {
    return NextResponse.json(
      { error: "intressentId required" },
      { status: 400 }
    );
  }

  const safeId = intressentId.replace(/'/g, "''");

  const sql = `
    with base as (
      select *
      from main_mart.mart_politician_touchpoints
      where intressent_id = '${safeId}'
    ),
    summary as (
      select
        b.intressent_id,
        p.party_clean as party,
        p.electoral_district,
        count(*) filter (where b.touchpoint_type = 'document') as documents_authored,
        count(*) filter (where b.touchpoint_type = 'speech') as speeches,
        count(*) filter (where b.touchpoint_type = 'vote') as votes,
        count(*) filter (where b.touchpoint_type = 'vote' and b.vote_choice = 'Ja') as yes_votes,
        count(*) filter (where b.touchpoint_type = 'vote' and b.vote_choice = 'Nej') as no_votes,
        count(*) filter (where b.touchpoint_type = 'vote' and b.vote_choice = 'Avstår') as abstain_votes,
        count(distinct b.parliamentary_session) as parliamentary_sessions_active,
        min(coalesce(b.event_timestamp, b.document_date)) as first_activity_date,
        max(coalesce(b.event_timestamp, b.document_date)) as last_activity_date
      from base b
      left join main_int.int_politicians p on p.intressent_id = b.intressent_id
      group by b.intressent_id, p.party_clean, p.electoral_district
    ),
    docs as (
      select
        b.dok_id,
        b.document_title,
        b.document_date,
        b.derived_doc_type
      from base b
      where b.touchpoint_type = 'document'
      order by coalesce(b.event_timestamp, b.document_date) desc nulls last
      limit 5
    ),
    votes as (
      select
        b.dok_id,
        b.document_title,
        b.document_date,
        b.vote_choice,
        b.vote_description,
        b.event_timestamp as vote_timestamp
      from base b
      where b.touchpoint_type = 'vote'
      order by b.event_timestamp desc nulls last
      limit 5
    ),
    speeches as (
      select
        coalesce(b.activity_id, b.dok_id) as speech_id,
        b.dok_id,
        b.document_title,
        b.document_date,
        b.parliamentary_session,
        b.event_timestamp as speech_timestamp
      from base b
      where b.touchpoint_type = 'speech'
      order by b.event_timestamp desc nulls last
      limit 5
    )
    select
      (select json_group_array(json_object(
        'intressent_id', s.intressent_id,
        'party', s.party,
        'electoral_district', s.electoral_district,
        'documents_authored', s.documents_authored,
        'speeches', s.speeches,
        'votes', s.votes,
        'yes_votes', s.yes_votes,
        'no_votes', s.no_votes,
        'abstain_votes', s.abstain_votes,
        'parliamentary_sessions_active', s.parliamentary_sessions_active,
        'first_activity_date', s.first_activity_date,
        'last_activity_date', s.last_activity_date
      )) from summary s) as summary,
      (select json_group_array(json_object(
        'dok_id', d.dok_id,
        'document_title', d.document_title,
        'document_date', d.document_date,
        'derived_doc_type', d.derived_doc_type
      )) from docs d) as docs,
      (select json_group_array(json_object(
        'dok_id', v.dok_id,
        'document_title', v.document_title,
        'document_date', v.document_date,
        'vote_choice', v.vote_choice,
        'vote_description', v.vote_description,
        'vote_timestamp', v.vote_timestamp
      )) from votes v) as votes,
      (select json_group_array(json_object(
        'speech_id', s.speech_id,
        'dok_id', s.dok_id,
        'document_title', s.document_title,
        'document_date', s.document_date,
        'parliamentary_session', s.parliamentary_session,
        'speech_timestamp', s.speech_timestamp
      )) from speeches s) as speeches
    ;
  `;

  try {
    const client = await MotherDuckClient.createInstance();
    const result = await client.execute(sql);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching politician activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch politician activity" },
      { status: 500 }
    );
  }
}

