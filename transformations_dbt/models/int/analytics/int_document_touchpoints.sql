-- Intermediate model: Document touchpoints
-- Extracts politician involvement in documents from stg_dokumentlista
-- Business logic moved from stg_document_touchpoints

with document_intressent as (
    select
        dok_id,
        datum as document_date,
        titel as document_title,
        doktyp as document_type,
        -- Extract intressent_id from nested JSON
        nullif(trim(json_extract_string(dokintressent__intressent, '$.intressent_id')), '') as intressent_id,
        json_extract_string(dokintressent__intressent, '$.roll') as role,
        json_extract_string(dokintressent__intressent, '$.ordning') as order_rank,
        _dlt_load_id,
        _dlt_id
    from {{ ref('stg_dokumentlista') }}
    where dokintressent__intressent is not null
        and dok_id is not null
),

document_with_person as (
    select
        di.dok_id,
        di.document_date,
        di.document_title,
        di.document_type,
        di.intressent_id,
        di.role,
        di.order_rank,
        p.parti as party,
        p.efternamn as last_name,
        p.tilltalsnamn as first_name,
        p.valkrets as electoral_district,
        di._dlt_load_id,
        di._dlt_id
    from document_intressent di
    left join {{ ref('stg_personlista') }} p
        on di.intressent_id = p.intressent_id
    where di.intressent_id is not null
)

select
    dok_id,
    document_date,
    document_title,
    document_type,
    intressent_id,
    role,
    order_rank,
    party,
    last_name,
    first_name,
    electoral_district,
    'document' as touchpoint_type,
    'authored' as touchpoint_category,
    _dlt_load_id,
    _dlt_id
from document_with_person
where intressent_id is not null
  and dok_id is not null

