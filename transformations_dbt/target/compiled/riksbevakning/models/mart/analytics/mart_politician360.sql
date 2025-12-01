-- Mart model: Politician360 - Complete politician touchpoint view
-- Final dataset for politician analysis and reporting

with politician_summary as (
    select
        p.intressent_id,
        p.display_name,
        p.full_name,
        p.party_clean as party,
        p.electoral_district,
        p.birth_year,
        p.gender,
        p.member_status,
        -- Touchpoint counts
        count(t.touchpoint_id) as total_touchpoints,
        count(case when t.touchpoint_type = 'vote' then 1 end) as total_votes,
        count(case when t.touchpoint_type = 'speech' then 1 end) as total_speeches,
        count(case when t.touchpoint_type = 'document' then 1 end) as total_documents,
        -- Date ranges
        min(t.touchpoint_date) as first_touchpoint_date,
        max(t.touchpoint_date) as last_touchpoint_date,
        -- Activity metrics
        count(distinct t.touchpoint_date) as active_days,
        count(distinct t.parliamentary_session) as parliamentary_sessions_active,
        -- Voting patterns
        count(case when t.vote_choice = 'Ja' then 1 end) as yes_votes,
        count(case when t.vote_choice = 'Nej' then 1 end) as no_votes,
        count(case when t.vote_choice = 'Avstår' then 1 end) as abstained_votes,
        -- Speech metrics
        avg(t.speech_length_chars) as avg_speech_length,
        sum(t.speech_length_chars) as total_speech_chars
    from "analytics"."main_stg"."stg_politicians" p
    left join "analytics"."main_int"."int_politician_touchpoints" t
        on p.intressent_id = t.intressent_id
    group by 
        p.intressent_id, p.display_name, p.full_name, p.party_clean, 
        p.electoral_district, p.birth_year, p.gender, p.member_status
),

politician_timeline as (
    select
        intressent_id,
        touchpoint_date,
        touchpoint_type,
        touchpoint_title,
        touchpoint_detail,
        parliamentary_session,
        vote_choice,
        row_number() over (
            partition by intressent_id 
            order by touchpoint_date desc, touchpoint_id
        ) as touchpoint_rank
    from "analytics"."main_int"."int_politician_touchpoints"
),

recent_activity as (
    select
        intressent_id,
        string_agg(
            touchpoint_type || ': ' || substr(touchpoint_title, 1, 50) || '...',
            ' | '
        ) as recent_touchpoints
    from politician_timeline
    where touchpoint_rank <= 5
    group by intressent_id
)

select
    s.*,
    -- Derived metrics
    case 
        when s.total_votes > 0 then 
            round(s.yes_votes::float / s.total_votes * 100, 1)
        else null 
    end as yes_vote_percentage,
    
    case 
        when s.total_touchpoints > 0 then 
            round(s.total_touchpoints::float / s.active_days, 1)
        else 0 
    end as avg_touchpoints_per_day,
    
    case 
        when s.birth_year is not null and s.birth_year != '' and s.birth_year ~ '^[0-9]{4}$' then 
            extract(year from current_date) - s.birth_year::int
        else null 
    end as current_age,
    
    -- Activity status
    case 
        when s.last_touchpoint_date::date > current_date - interval '30 days' then 'Very Active'
        when s.last_touchpoint_date::date > current_date - interval '90 days' then 'Active'
        when s.last_touchpoint_date::date > current_date - interval '365 days' then 'Less Active'
        else 'Inactive'
    end as activity_status,
    
    -- Recent activity summary
    r.recent_touchpoints,
    
    -- Metadata
    current_timestamp as created_at

from politician_summary s
left join recent_activity r
    on s.intressent_id = r.intressent_id
order by s.total_touchpoints desc, s.display_name