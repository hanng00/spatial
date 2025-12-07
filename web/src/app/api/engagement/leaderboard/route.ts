import { MotherDuckClient } from "@/lib/motherduck";
import { NextResponse } from "next/server";

type Params = {
  window_days?: string | null;
  limit?: string | null;
};

const DEFAULT_WINDOW_DAYS = 7;
const DEFAULT_LIMIT = 20;

function parseIntParam(raw: string | null | undefined, fallback: number, max: number) {
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(n, max);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const windowDays = parseIntParam(searchParams.get("window_days"), DEFAULT_WINDOW_DAYS, 90);
  const limit = parseIntParam(searchParams.get("limit"), DEFAULT_LIMIT, 100);

  // Windowed score heuristic: docs*3 + speeches*1 + votes*2, computed only
  // from events within the selected window to avoid mixing lifetime counts.
  const sql = `
    with filtered_edges as (
      select *
      from main_mart.mart_document_edges
      where intressent_id is not null
        and timestamp >= current_date - interval '${windowDays} days'
    ),
    agg as (
      select
        intressent_id,
        count(distinct case when relation_type = 'person_involved' then source_id end) as documents_authored,
        count(distinct case when relation_type = 'speech' then source_id end) as speeches,
        count(distinct case when relation_type = 'vote' then source_id end) as votes,
        count(case when relation_type = 'vote' and vote_choice = 'Ja' then 1 end) as yes_votes,
        count(case when relation_type = 'vote' and vote_choice = 'Nej' then 1 end) as no_votes,
        count(case when relation_type = 'vote' and vote_choice = 'Avstår' then 1 end) as abstain_votes,
        count(distinct parliamentary_session) as parliamentary_sessions_active,
        min(timestamp) as first_activity_date,
        max(timestamp) as last_activity_date
      from filtered_edges
      group by intressent_id
    ),
    person as (
      select
        intressent_id,
        display_name,
        party_clean as party,
        electoral_district
      from main_int.int_politicians
    )
    select
      a.intressent_id,
      coalesce(p.display_name, a.intressent_id) as display_name,
      p.party,
      p.electoral_district,
      a.documents_authored,
      a.speeches,
      a.votes,
      a.yes_votes,
      a.no_votes,
      a.abstain_votes,
      a.first_activity_date,
      a.last_activity_date,
      (coalesce(a.documents_authored,0)*3 + coalesce(a.speeches,0) + coalesce(a.votes,0)*2) as score
    from agg a
    left join person p on p.intressent_id = a.intressent_id
    where a.last_activity_date is not null
    order by score desc, last_activity_date desc
    limit ${limit};
  `;

  try {
    const client = await MotherDuckClient.createInstance();
    const result = await client.execute(sql);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching engagement leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch engagement leaderboard" },
      { status: 500 }
    );
  }
}

