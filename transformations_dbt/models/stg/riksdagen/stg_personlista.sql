-- Staging model for personlista (members)
-- Raw passthrough - only source abstraction layer
-- Business logic belongs in int layer

select
    intressent_id,
    hangar_id,
    tilltalsnamn,
    efternamn,
    sorteringsnamn,
    parti,
    valkrets,
    iort,
    fodd_ar,
    kon,
    status,
    personuppdrag,
    personuppgift,
    _dlt_load_id,
    _dlt_id
from {{ source('raw_riksdagen', 'personlista') }}
where intressent_id is not null
