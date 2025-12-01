-- Staging model for politicians (personlista)
-- Creates clean politician master data

select
    intressent_id,
    hangar_id,
    tilltalsnamn as first_name,
    efternamn as last_name,
    sorteringsnamn as display_name,
    parti as party,
    valkrets as electoral_district,
    iort as birthplace,
    fodd_ar as birth_year,
    kon as gender,
    status as member_status,
    -- Extract nested data
    personuppdrag as assignments_raw,
    personuppgift as personal_info_raw,
    -- Clean party name
    trim(upper(parti)) as party_clean,
    -- Create full name
    concat(tilltalsnamn, ' ', efternamn) as full_name,
    -- Add metadata
    _dlt_load_id,
    _dlt_id
from "raw"."riksdagen"."personlista"
where intressent_id is not null