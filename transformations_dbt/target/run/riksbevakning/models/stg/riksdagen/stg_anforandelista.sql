
  
  create view "analytics"."main_stg"."stg_anforandelista__dbt_tmp" as (
    -- Staging model for anforandelista (speeches)
-- Cleans and standardizes the raw data from riksdagen API

select
    systemnyckel,
    dok_datum,
    dok_rm as rm,
    dok_id,
    dok_titel,
    anforande_id,
    anforande_nummer,
    talare,
    parti,
    anforandetext as anforande_text,
    intressent_id,
    -- Add any cleaning/standardization here
    trim(upper(parti)) as parti_clean,
    case 
        when dok_datum is not null then dok_datum
        else '1900-01-01'
    end as dok_datum_clean,
    -- Additional fields
    avsnittsrubrik,
    underrubrik,
    kammaraktivitet,
    replik,
    systemdatum
from "raw"."riksdagen"."anforandelista"
  );
