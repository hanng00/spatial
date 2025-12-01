
  
    
    

    create  table
      "analytics"."main_int"."int_politician_touchpoints__dbt_tmp"
  
    as (
      -- Intermediate model: Unified politician touchpoints
-- Combines all touchpoint types with direct intressent_id matching

with all_touchpoints as (
    -- Document touchpoints
    select
        intressent_id,
        dok_id as touchpoint_id,
        document_date as touchpoint_date,
        document_title as touchpoint_title,
        touchpoint_type,
        touchpoint_category,
        party,
        first_name,
        last_name,
        electoral_district,
        role as touchpoint_detail,
        null as parliamentary_session,
        null as vote_choice,
        null as speech_length_chars
    from "analytics"."main_stg"."stg_document_touchpoints"
    
    union all
    
    -- Speech touchpoints (now with direct intressent_id)
    select
        intressent_id,
        speech_id as touchpoint_id,
        speech_date as touchpoint_date,
        document_title as touchpoint_title,
        touchpoint_type,
        touchpoint_category,
        party,
        null as first_name,
        null as last_name,
        null as electoral_district,
        speech_order as touchpoint_detail,
        parliamentary_session,
        null as vote_choice,
        speech_length_chars
    from "analytics"."main_stg"."stg_speech_touchpoints"
    
    union all
    
    -- Voting touchpoints
    select
        intressent_id,
        votering_id as touchpoint_id,
        vote_timestamp::date as touchpoint_date,
        vote_description as touchpoint_title,
        touchpoint_type,
        touchpoint_category,
        party,
        first_name,
        last_name,
        electoral_district,
        vote_subject as touchpoint_detail,
        parliamentary_session,
        vote_choice,
        null as speech_length_chars
    from "analytics"."main_stg"."stg_voting_touchpoints"
)

select
    intressent_id,
    touchpoint_id,
    touchpoint_date,
    touchpoint_title,
    touchpoint_type,
    touchpoint_category,
    party,
    first_name,
    last_name,
    electoral_district,
    touchpoint_detail,
    parliamentary_session,
    vote_choice,
    speech_length_chars,
    -- Add derived fields
    extract(year from touchpoint_date::date) as touchpoint_year,
    extract(month from touchpoint_date::date) as touchpoint_month,
    case 
        when touchpoint_type = 'vote' then 'Voting'
        when touchpoint_type = 'speech' then 'Speaking'
        when touchpoint_type = 'document' then 'Document'
        else 'Other'
    end as touchpoint_type_label
from all_touchpoints
where intressent_id is not null
order by intressent_id, touchpoint_date desc
    );
  
  