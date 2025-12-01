
  
  create view "analytics"."main_stg"."stg_personlista__dbt_tmp" as (
    -- Staging model for personlista (members)
-- Cleans and standardizes the raw data from riksdagen API

select
    -- Add all relevant columns from personlista
    -- This is a placeholder - adjust based on actual schema
    *
from "raw"."riksdagen"."personlista"
  );
