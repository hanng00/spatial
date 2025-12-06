-- Document edges from voteringlista
-- Each edge: vote -> document (target), with rm/beteckning/punkt for join context

select
    v.dok_id as target_dok_id,
    v.votering_id,
    v.intressent_id,
    v.rm as parliamentary_session,
    v.beteckning,
    v.punkt,
    v.avser as vote_subject,
    v.votering as vote_description,
    v.rost as vote_choice,
    v.systemdatum as vote_timestamp,
    'vote' as relation_type,
    'vote_on_document' as relation_subtype,
    'dok_id' as source_field
from {{ ref('stg_voteringlista') }} v
where v.dok_id is not null

