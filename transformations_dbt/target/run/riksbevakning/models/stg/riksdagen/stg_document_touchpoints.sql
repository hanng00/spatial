
  
  create view "analytics"."main_stg"."stg_document_touchpoints__dbt_tmp" as (
    -- Staging model for document touchpoints
-- Extracts politician involvement in documents

with document_intressent as (
    select
        dok_id,
        datum as document_date,
        titel as document_title,
        doktyp as document_type,
        parti as party,
        efternamn as last_name,
        tilltalsnamn as first_name,
        valkrets as electoral_district,
        -- Extract intressent_id from nested JSON
        json_extract_string(dokintressent__intressent, '$.intressent_id') as intressent_id,
        json_extract_string(dokintressent__intressent, '$.roll') as role,
        json_extract_string(dokintressent__intressent, '$.ordning') as order_rank,
        _dlt_load_id,
        _dlt_id
    from "raw"."riksdagen"."dokumentlista"
    where dokintressent__intressent is not null
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
from document_intressent
where intressent_id is not null
  );
