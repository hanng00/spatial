
  
  create view "analytics"."main"."anforanden_count__dbt_tmp" as (
    -- This model is deprecated - moved to stg layer
-- Use stg.riksdagen.stg_anforandelista instead
select
  count(*) as anforanden_count
from "raw"."riksdagen"."anforandelista"
  );
