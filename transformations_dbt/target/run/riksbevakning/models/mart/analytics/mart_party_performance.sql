
  
    
    

    create  table
      "analytics"."main_mart"."mart_party_performance__dbt_tmp"
  
    as (
      -- Mart model: Party performance metrics
-- Final dataset for party analysis and reporting

select
    party,
    speech_count,
    days_with_speeches,
    first_speech_date,
    last_speech_date,
    -- Calculate derived metrics
    round(speech_count::float / days_with_speeches, 2) as avg_speeches_per_day,
    case 
        when last_speech_date::date > current_date - interval '30 days' then 'Active'
        else 'Inactive'
    end as activity_status
from "analytics"."main_int"."int_speeches_by_party"
order by speech_count desc
    );
  
  