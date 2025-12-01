
  
    
    

    create  table
      "analytics"."main_mart"."mart_daily_speech_summary__dbt_tmp"
  
    as (
      -- Mart model: Daily speech summary for consumption
-- Final dataset ready for dashboards and analysis

select
    dok_datum_clean as speech_date,
    count(*) as total_speeches,
    count(distinct parti_clean) as parties_active,
    count(distinct dok_id) as unique_documents,
    count(distinct rm) as parliamentary_sessions
from "analytics"."main_stg"."stg_anforandelista"
where dok_datum_clean is not null
group by dok_datum_clean
order by dok_datum_clean desc
    );
  
  