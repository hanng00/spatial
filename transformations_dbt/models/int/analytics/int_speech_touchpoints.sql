-- Intermediate model: Speech touchpoints
-- Extracts politician speeches from stg_anforandelista
-- Business logic moved from stg_speech_touchpoints

select
    systemnyckel as speech_id,
    dok_datum as speech_date,
    dok_id as document_id,
    dok_titel as document_title,
    anforande_id as speech_number,
    anforande_nummer as speech_order,
    talare as speaker_name,
    parti as party,
    anforandetext as speech_text,
    dok_rm as parliamentary_session,
    intressent_id,
    'speech' as touchpoint_type,
    'spoken' as touchpoint_category,
    length(anforandetext) as speech_length_chars,
    avsnittsrubrik as section_title,
    underrubrik as subsection_title,
    kammaraktivitet as chamber_activity,
    replik as reply_type,
    systemdatum as speech_timestamp,
    _dlt_load_id,
    _dlt_id
from {{ ref('stg_anforandelista') }}
where talare is not null
  and intressent_id is not null

