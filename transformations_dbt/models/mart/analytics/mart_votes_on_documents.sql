-- Mart: Votes associated with documents (simplified from voteringlista)

select
    votering_id,
    dok_id,
    rm as parliamentary_session,
    beteckning,
    punkt,
    votering as vote_description,
    avser as vote_subject,
    intressent_id,
    parti as party,
    rost as vote_choice,
    systemdatum as vote_timestamp
from {{ ref('stg_voteringlista') }}
where dok_id is not null and length(dok_id) > 0

