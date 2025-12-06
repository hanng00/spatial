-- Mart: Lean activity rollup by politician

with edges as (
    select
        intressent_id,
        relation_type,
        source_id,
        parliamentary_session,
        vote_choice,
        timestamp
    from {{ ref('mart_document_edges') }}
    where intressent_id is not null
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
    from edges
    group by intressent_id
),
person as (
    select
        intressent_id,
        party_clean as party,
        electoral_district
    from {{ ref('int_politicians') }}
)

select
    coalesce(p.intressent_id, a.intressent_id) as intressent_id,
    p.party,
    p.electoral_district,
    coalesce(a.documents_authored, 0) as documents_authored,
    coalesce(a.speeches, 0) as speeches,
    coalesce(a.votes, 0) as votes,
    coalesce(a.yes_votes, 0) as yes_votes,
    coalesce(a.no_votes, 0) as no_votes,
    coalesce(a.abstain_votes, 0) as abstain_votes,
    coalesce(a.parliamentary_sessions_active, 0) as parliamentary_sessions_active,
    a.first_activity_date,
    a.last_activity_date
from person p
left join agg a on p.intressent_id = a.intressent_id
where p.intressent_id is not null

