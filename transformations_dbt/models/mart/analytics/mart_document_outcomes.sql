-- Mart: Derived outcomes for documents (initial stub based on vote presence)

with votes as (
    select dok_id, count(*) as vote_rows
    from {{ ref('mart_votes_on_documents') }}
    group by dok_id
),
outcomes as (
    select
        v.dok_id,
        case
            when v.vote_rows > 0 then 'voted'
            else 'unknown'
        end as derived_outcome,
        v.vote_rows
    from votes v
)

select
    d.dok_id,
    coalesce(o.derived_outcome, 'unknown') as derived_outcome,
    coalesce(o.vote_rows, 0) as vote_rows
from {{ ref('mart_document_graph') }} d
left join outcomes o on d.dok_id = o.dok_id

