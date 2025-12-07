-- Mart: Per-politician unified touchpoints (docs, motions, speeches, votes)
-- Enables a single-query fetch of everything an intressent is involved in.
-- Uses int_document_edges to capture person_involved, speech, and vote edges,
-- then joins document metadata for convenient downstream use (e.g. API/BI).

with edges as (
    select
        intressent_id,
        relation_type,
        relation_subtype,
        source_id,
        target_id,
        vote_choice,
        vote_subject,
        vote_description,
        parliamentary_session,
        timestamp
    from {{ ref('int_document_edges') }}
    where intressent_id is not null
      and relation_type in ('person_involved', 'vote', 'speech')
),
touchpoints as (
    select
        intressent_id,
        relation_type,
        relation_subtype,
        -- For person_involved the document is the source; for vote/speech it is the target
        case
            when relation_type = 'person_involved' then source_id
            else target_id
        end as dok_id,
        -- Activity-level identifier (vote id or speech id) when available
        case
            when relation_type in ('vote', 'speech') then source_id
            else null
        end as activity_id,
        case
            when relation_type = 'person_involved' then 'document'
            else relation_type
        end as touchpoint_type,
        vote_choice,
        vote_subject,
        vote_description,
        parliamentary_session,
        timestamp as event_timestamp
    from edges
),
docs as (
    select
        dok_id,
        document_title,
        document_subtitle,
        derived_doc_type,
        document_date,
        rm,
        beteckning,
        committee,
        dokument_url_html,
        dokument_url_text
    from {{ ref('int_document_nodes') }}
)

select
    t.intressent_id,
    t.touchpoint_type,
    t.relation_type,
    t.relation_subtype,
    t.dok_id,
    t.activity_id,
    d.document_title,
    d.document_subtitle,
    d.derived_doc_type,
    d.document_date,
    d.rm,
    d.beteckning,
    d.committee,
    d.dokument_url_html,
    d.dokument_url_text,
    t.vote_choice,
    t.vote_subject,
    t.vote_description,
    t.parliamentary_session,
    t.event_timestamp
from touchpoints t
left join docs d on d.dok_id = t.dok_id
where t.dok_id is not null
order by t.intressent_id, t.event_timestamp desc nulls last, t.dok_id, t.activity_id

