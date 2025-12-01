
  
  create view "analytics"."main_stg"."stg_dokumentlista__dbt_tmp" as (
    -- Staging model for dokumentlista (documents)
-- Cleans and standardizes the raw data from riksdagen API

select
    -- Add all relevant columns from dokumentlista
    -- This is a placeholder - adjust based on actual schema
    *
from "raw"."riksdagen"."dokumentlista"
  );
