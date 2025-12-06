-- Mart: Document graph nodes with edge counts and linkage signals

with nodes as (
    select * from {{ ref('int_document_nodes') }}
),
edges as (
    select * from {{ ref('int_document_edges') }}
),
outgoing_counts as (
    select
        source_id as id,
        count(*) as outgoing_edges,
        count(*) filter (where relation_type = 'reference') as outgoing_reference_edges,
        count(*) filter (where relation_type = 'person_involved') as outgoing_person_edges,
        count(*) filter (where relation_type = 'speech') as outgoing_speech_edges,
        count(*) filter (where relation_type = 'vote') as outgoing_vote_edges
    from edges
    where source_id is not null
    group by source_id
),
incoming_counts as (
    select
        target_id as id,
        count(*) as incoming_edges,
        count(*) filter (where relation_type = 'reference') as incoming_reference_edges,
        count(*) filter (where relation_type = 'speech') as incoming_speech_edges,
        count(*) filter (where relation_type = 'vote') as incoming_vote_edges
    from edges
    where target_id is not null
    group by target_id
)

select
    n.*,
    coalesce(o.outgoing_edges, 0) as outgoing_edges,
    coalesce(o.outgoing_reference_edges, 0) as outgoing_reference_edges,
    coalesce(o.outgoing_person_edges, 0) as outgoing_person_edges,
    coalesce(o.outgoing_speech_edges, 0) as outgoing_speech_edges,
    coalesce(o.outgoing_vote_edges, 0) as outgoing_vote_edges,
    coalesce(i.incoming_edges, 0) as incoming_edges,
    coalesce(i.incoming_reference_edges, 0) as incoming_reference_edges,
    coalesce(i.incoming_speech_edges, 0) as incoming_speech_edges,
    coalesce(i.incoming_vote_edges, 0) as incoming_vote_edges
from nodes n
left join outgoing_counts o on n.dok_id = o.id
left join incoming_counts i on n.dok_id = i.id

