-- Document edges to intressenter (persons/roles) from dokintressent__intressent JSON
-- Each edge: document -> intressent

with exploded as (
    select
        d.dok_id as source_dok_id,
        coalesce(json_array_length(d.dokintressent__intressent), 0)::bigint as dokintressent_len,
        unnest(
            range(
                0::bigint,
                coalesce(json_array_length(d.dokintressent__intressent), 0)::bigint
            )
        ) as idx
    from {{ ref('stg_dokumentlista') }} d
    where d.dokintressent__intressent is not null
),
extracted as (
    select
        e.source_dok_id,
        json_extract_string(d.dokintressent__intressent, '$[' || e.idx || '].intressent_id') as intressent_id,
        json_extract_string(d.dokintressent__intressent, '$[' || e.idx || '].roll') as role,
        json_extract_string(d.dokintressent__intressent, '$[' || e.idx || '].namn') as name,
        json_extract_string(d.dokintressent__intressent, '$[' || e.idx || '].partibet') as party_code,
        json_extract_string(d.dokintressent__intressent, '$[' || e.idx || '].ordning') as ordning,
        d.systemdatum as document_timestamp,
        e.idx as array_index
    from exploded e
    join {{ ref('stg_dokumentlista') }} d
      on d.dok_id = e.source_dok_id
)

select
    source_dok_id,
    intressent_id,
    'person_involved' as relation_type,
    role as relation_subtype,
    'dokintressent__intressent' as source_field,
    name as intressent_name,
    party_code,
    ordning as role_order,
    document_timestamp,
    array_index
from extracted
where intressent_id is not null and length(intressent_id) > 0

