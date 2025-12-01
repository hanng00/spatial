-- Mart model: Document geography aggregation
-- Aggregates documents by electoral district and time
-- Provides spatiotemporal insights for map visualization

with district_aggregates as (
    select
        electoral_district,
        document_year,
        document_month,
        -- Counts
        count(distinct dok_id) as document_count,
        count(distinct intressent_id) as politician_count,
        count(distinct party) as party_count,
        -- Document type breakdown
        count(distinct case when document_type = 'fr' then dok_id end) as question_count,
        count(distinct case when document_type = 'prop' then dok_id end) as proposition_count,
        count(distinct case when document_type = 'bet' then dok_id end) as report_count,
        count(distinct case when document_type = 'motion' then dok_id end) as motion_count,
        -- Committee breakdown
        count(distinct committee) as committee_count,
        -- Temporal metadata
        min(document_date) as first_document_date,
        max(document_date) as last_document_date
    from {{ ref('int_document_geography') }}
    where electoral_district is not null
    group by
        electoral_district,
        document_year,
        document_month
)

select
    electoral_district,
    document_year,
    document_month,
    document_count,
    politician_count,
    party_count,
    question_count,
    proposition_count,
    report_count,
    motion_count,
    committee_count,
    first_document_date,
    last_document_date,
    -- Create a composite key for time-series analysis
    concat(electoral_district, '_', cast(document_year as varchar), '_', 
           lpad(cast(document_month as varchar), 2, '0')) as geography_time_key
from district_aggregates
order by
    electoral_district,
    document_year desc,
    document_month desc
