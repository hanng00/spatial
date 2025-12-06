-- Mart: Simple topic tagging for documents (rule-based placeholder)

with topics as (
    select
        dok_id,
        document_title,
        lower(concat_ws(' ', document_title, coalesce(committee, ''), coalesce(beteckning, ''))) as text_blob
    from {{ ref('int_document_nodes') }}
),
tagged as (
    select
        dok_id,
        case
            when text_blob like '%skola%' or text_blob like '%utbild%' then 'education'
            when text_blob like '%sjukv%' or text_blob like '%h%C3%A4lsa%' or text_blob like '%v%C3%A5rd%' then 'health'
            when text_blob like '%klimat%' or text_blob like '%milj%' then 'climate_environment'
            when text_blob like '%brott%' or text_blob like '%krim%' or text_blob like '%polis%' then 'crime'
            when text_blob like '%skatt%' or text_blob like '%budget%' or text_blob like '%finans%' then 'economy_tax'
            when text_blob like '%migration%' or text_blob like '%asyl%' or text_blob like '%invandr%' then 'migration'
            else 'other'
        end as topic
    from topics
)

select dok_id, topic from tagged

