-- Mart: Document-level geography summary

with agg as (
    select
        dok_id,
        min(document_date) as first_document_date,
        max(document_date) as last_document_date,
        count(distinct electoral_district) as district_count,
        count(distinct intressent_id) as politician_count,
        count(distinct party) as party_count,
        count(*) as touchpoint_rows
    from {{ ref('int_document_geography') }}
    group by dok_id
)

select * from agg

