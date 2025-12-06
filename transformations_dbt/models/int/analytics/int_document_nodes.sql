-- Intermediate model: Document nodes for graph/search
-- Parses dok_id, derives series/type, and surfaces basic metadata + lightweight quality signals

with base as (
    select
        dok_id,
        _dlt_id,
        titel as document_title,
        undertitel as document_subtitle,
        typ as typ_raw,
        doktyp as doktyp_raw,
        subtyp as subtyp_raw,
        rm,
        datum as document_date,
        publicerad as published_at,
        systemdatum as system_timestamp,
        organ as committee,
        beteckning,
        tempbeteckning,
        nummer,
        slutdatum,
        status,
        dokument_url_html,
        dokument_url_text,
        dokumentstatus_url_xml,
        -- Derived from dok_id when present
        substring(dok_id, 1, 2) as rm_code,
        substring(dok_id, 3, 2) as series_code,
        substring(dok_id, 5) as dok_beteckning,
        -- Presence counts for helpful diagnostics
        case when dokreferens__referens is null then 0 else coalesce(json_array_length(dokreferens__referens), 1) end as reference_count,
        case when dokintressent__intressent is null then 0 else coalesce(json_array_length(dokintressent__intressent), 1) end as intressent_count,
        case when filbilaga__fil is null then 0 else coalesce(json_array_length(filbilaga__fil), 1) end as attachment_count
    from {{ ref('stg_dokumentlista') }}
    where dok_id is not null
),
deduped as (
    select
        *,
        row_number() over (
            partition by dok_id
            order by system_timestamp desc nulls last, _dlt_id desc nulls last
        ) as dok_id_rank
    from base
)

select
    dok_id,
    document_title,
    document_subtitle,
    typ_raw,
    doktyp_raw,
    subtyp_raw,
    rm,
    document_date,
    published_at,
    system_timestamp,
    committee,
    beteckning,
    tempbeteckning,
    nummer,
    slutdatum,
    status,
    dokument_url_html,
    dokument_url_text,
    dokumentstatus_url_xml,
    rm_code,
    series_code,
    dok_beteckning,
    -- Derived document type from series code; falls back to raw typ/doktyp
    coalesce(
        case
            when series_code = '01' then 'bet'
            when series_code = '02' then 'mot'
            when series_code = '03' then 'prop'
            when series_code = '04' then 'prop'
            when series_code = '05' then 'prop'
            when series_code = '06' then 'prop'
            when series_code = '07' then 'prop'
            when series_code = '08' then 'prop'
            when series_code = '09' then 'prop'
            when series_code = '10' then 'ip'
            when series_code = '11' then 'fr'
            when series_code = '12' then 'frs'
            when series_code = 'C1' then 'kammakt'
            when series_code = 'C2' then 'sammankomst'
            when series_code = 'C3' then 'votering'
            when series_code = 'C4' then 'kalender'
            when series_code = 's-' then 'sfs'
            else null
        end,
        typ_raw,
        doktyp_raw
    ) as derived_doc_type,
    reference_count,
    intressent_count,
    attachment_count
from deduped
where dok_id is not null
  and dok_id_rank = 1

