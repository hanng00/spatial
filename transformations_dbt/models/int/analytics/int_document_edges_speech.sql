-- Each edge: speech -> document (target), plus party/talare metadata

select
    a.rel_dok_id as target_dok_id,
    a.anforande_id as speech_id,
    a.intressent_id,
    a.parti as party,
    a.talare as speaker_name,
    a.dok_rm as parliamentary_session,
    a.dok_titel as document_title,
    a.dok_datum as document_date,
    a.systemdatum as speech_timestamp,
    'speech' as relation_type,
    'speech_to_document' as relation_subtype,
    'rel_dok_id' as source_field
from {{ ref('stg_anforandelista') }} a
where a.rel_dok_id is not null

