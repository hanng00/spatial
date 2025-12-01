-- Intermediate model: Voting touchpoints
-- Extracts politician voting records from stg_voteringlista
-- Business logic moved from stg_voting_touchpoints

select
    votering_id,
    intressent_id,
    namn as full_name,
    fornamn as first_name,
    efternamn as last_name,
    parti as party,
    valkrets as electoral_district,
    iort as birthplace,
    kon as gender,
    fodd as birth_year,
    rost as vote_choice,
    avser as vote_subject,
    votering as vote_description,
    dok_id as document_id,
    beteckning as document_reference,
    punkt as document_point,
    rm as parliamentary_session,
    systemdatum as vote_timestamp,
    'vote' as touchpoint_type,
    'voted' as touchpoint_category,
    _dlt_load_id,
    _dlt_id
from {{ ref('stg_voteringlista') }}
where intressent_id is not null

