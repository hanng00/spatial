-- Document edges from explicit references in dokreferens__referens JSON
-- Each edge: source document -> referenced document (target)

with exploded as (
    select
        d.dok_id as source_dok_id,
        coalesce(json_array_length(d.dokreferens__referens), 0)::bigint as ref_len,
        ref_idx,
        json_extract_string(d.dokreferens__referens, '$[' || ref_idx || '].ref_dok_id') as target_dok_id,
        json_extract_string(d.dokreferens__referens, '$[' || ref_idx || '].ref_dok_typ') as target_dok_type,
        json_extract_string(d.dokreferens__referens, '$[' || ref_idx || '].ref_dok_rm') as target_rm,
        json_extract_string(d.dokreferens__referens, '$[' || ref_idx || '].ref_dok_bet') as target_beteckning,
        json_extract_string(d.dokreferens__referens, '$[' || ref_idx || '].ref_dok_titel') as target_title,
        json_extract_string(d.dokreferens__referens, '$[' || ref_idx || '].referenstyp') as reference_type,
        json_extract_string(d.dokreferens__referens, '$[' || ref_idx || '].uppgift') as reference_note
    from {{ ref('stg_dokumentlista') }} d,
    lateral (
        select unnest(
            range(
                0::bigint,
                coalesce(json_array_length(d.dokreferens__referens), 0)::bigint
            )
        ) as ref_idx
    )
    where d.dokreferens__referens is not null
      and coalesce(json_array_length(d.dokreferens__referens), 0) > 0
      and d.dok_id is not null
)

select
    source_dok_id,
    target_dok_id,
    'reference' as relation_type,
    reference_type as relation_subtype,
    'dokreferens__referens' as source_field,
    target_dok_type,
    target_rm,
    target_beteckning,
    target_title,
    ref_len as reference_array_length,
    ref_idx as reference_index
from exploded
where target_dok_id is not null and length(target_dok_id) > 0
  and source_dok_id is not null

