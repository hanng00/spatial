-- Intermediate model: Document geography enrichment
-- Links documents to geographic locations via politician involvement
-- Properly handles JSON arrays in dokintressent__intressent field

with document_with_indices as (
    -- Generate indices for each element in the JSON array
    select 
        d.*,
        unnest(generate_series(0::BIGINT, json_array_length(d.dokintressent__intressent)::BIGINT - 1)) as idx
    from {{ ref('stg_dokumentlista') }} d
    where d.dokintressent__intressent is not null
        and d.dok_id is not null
),

document_intressent_unnested as (
    -- Extract intressent_id and role from each array element
    select
        dok_id,
        datum as document_date,
        titel as document_title,
        doktyp as document_type,
        typ as document_category,
        organ as committee,
        rm as parliamentary_session,
        plats as explicit_location,
        publicerad as published_date,
        inlamnad as submitted_date,
        debattdag as debate_date,
        beslutsdag as decision_date,
        json_extract_string(dokintressent__intressent, '$[' || idx::VARCHAR || '].intressent_id') as intressent_id,
        json_extract_string(dokintressent__intressent, '$[' || idx::VARCHAR || '].roll') as role,
        _dlt_load_id,
        _dlt_id
    from document_with_indices
    where json_extract_string(dokintressent__intressent, '$[' || idx::VARCHAR || '].intressent_id') is not null
),

document_with_geography as (
    -- Join with politicians to get electoral districts
    select
        diu.dok_id,
        diu.document_date,
        diu.document_title,
        diu.document_type,
        diu.document_category,
        diu.committee,
        diu.parliamentary_session,
        diu.intressent_id,
        diu.role,
        diu.explicit_location,
        -- Geographic data from politician
        p.valkrets as electoral_district,
        p.parti as party,
        -- Temporal data
        diu.published_date,
        diu.submitted_date,
        diu.debate_date,
        diu.decision_date,
        -- Extract year and month for temporal aggregation
        cast(substring(diu.document_date, 1, 4) as integer) as document_year,
        cast(substring(diu.document_date, 6, 2) as integer) as document_month,
        diu._dlt_load_id,
        diu._dlt_id
    from document_intressent_unnested diu
    left join {{ ref('stg_personlista') }} p
        on diu.intressent_id = p.intressent_id
    where diu.intressent_id is not null
        and trim(diu.intressent_id) != ''
)

select
    dok_id,
    document_date,
    document_title,
    document_type,
    document_category,
    committee,
    parliamentary_session,
    intressent_id,
    role,
    explicit_location,
    electoral_district,
    party,
    published_date,
    submitted_date,
    debate_date,
    decision_date,
    document_year,
    document_month,
    _dlt_load_id,
    _dlt_id
from document_with_geography
where electoral_district is not null
    or explicit_location is not null
