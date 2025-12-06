-- Mart: Geographic footprint per politician using document geography points

with points as (
    select
        intressent_id,
        dok_id,
        electoral_district,
        party,
        document_date
    from {{ ref('mart_document_geography_points') }}
    where intressent_id is not null
)

select
    intressent_id,
    count(distinct dok_id) as document_count,
    count(distinct electoral_district) as district_count,
    count(distinct party) as party_count,
    min(document_date) as first_document_date,
    max(document_date) as last_document_date
from points
group by intressent_id

