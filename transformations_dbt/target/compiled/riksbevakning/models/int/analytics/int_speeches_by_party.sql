-- Intermediate model: Speeches aggregated by party
-- Combines staging data to create analytics-ready aggregations

select
    parti_clean as party,
    count(*) as speech_count,
    count(distinct dok_datum) as days_with_speeches,
    min(dok_datum_clean) as first_speech_date,
    max(dok_datum_clean) as last_speech_date
from "analytics"."main_stg"."stg_anforandelista"
where parti_clean is not null
group by parti_clean
order by speech_count desc