-- Staging model for anforandelista (speeches)
-- Raw passthrough - only source abstraction layer
-- Business logic belongs in int layer

select
    systemnyckel,
    dok_datum,
    dok_rm,
    dok_id,
    dok_titel,
    anforande_id,
    anforande_nummer,
    talare,
    parti,
    anforandetext,
    intressent_id,
    avsnittsrubrik,
    underrubrik,
    kammaraktivitet,
    replik,
    systemdatum,
    _dlt_load_id,
    _dlt_id
from {{ source('raw_riksdagen', 'anforandelista') }}
where talare is not null
