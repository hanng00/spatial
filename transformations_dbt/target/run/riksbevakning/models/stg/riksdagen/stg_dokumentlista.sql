
  
  create view "spatial_dagster"."main_stg"."stg_dokumentlista__dbt_tmp" as (
    -- Staging model for dokumentlista (documents)
-- Raw passthrough - only source abstraction layer
-- Business logic belongs in int layer
-- Using SELECT * to include all columns that exist in source table

with ranked as (
    select
        *,
        row_number() over (
            partition by _dlt_id
            order by systemdatum desc nulls last
        ) as rn
    from "spatial_dagster"."raw_riksdagen"."dokumentlista"
)

select
    *
from ranked
where rn = 1
  );
