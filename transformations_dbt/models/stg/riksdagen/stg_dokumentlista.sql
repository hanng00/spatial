-- Staging model for dokumentlista (documents)
-- Raw passthrough - only source abstraction layer
-- Business logic belongs in int layer
-- Using SELECT * to include all columns that exist in source table

with ranked as (
    select
        *,
        -- Normalize array lengths to BIGINT for downstream range/unnest usage
        coalesce(json_array_length(dokintressent__intressent)::bigint, 0) as dokintressent_len,
        coalesce(json_array_length(dokreferens__referens)::bigint, 0) as dokreferens_len,
        nullif(trim(dok_id), '') as dok_id_normalized,
        row_number() over (
            partition by _dlt_id
            order by systemdatum desc nulls last
        ) as rn
    from {{ source('raw_riksdagen', 'dokumentlista') }}
)

select
    *
from ranked
where rn = 1
