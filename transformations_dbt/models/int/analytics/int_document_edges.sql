-- Unified document edges
-- Unions reference, person, speech, and vote edges with a common schema

with refs as (
    select
        source_dok_id as source_id,
        target_dok_id as target_id,
        relation_type,
        relation_subtype,
        source_field,
        target_dok_type as target_type_hint,
        target_rm as target_rm_hint,
        target_beteckning as target_beteckning_hint,
        target_title as target_title_hint,
        reference_array_length as source_array_length,
        reference_index as source_array_index,
        null as intressent_id,
        null as vote_choice,
        null as vote_subject,
        null as vote_description,
        null as parliamentary_session,
        null as timestamp
    from {{ ref('int_document_edges_refs') }}
),
persons as (
    select
        source_dok_id as source_id,
        null as target_id,
        relation_type,
        relation_subtype,
        source_field,
        null as target_type_hint,
        null as target_rm_hint,
        null as target_beteckning_hint,
        null as target_title_hint,
        null as source_array_length,
        array_index as source_array_index,
        intressent_id,
        null as vote_choice,
        null as vote_subject,
        null as vote_description,
        null as parliamentary_session,
        null as timestamp
    from {{ ref('int_document_edges_intressent') }}
),
speeches as (
    select
        speech_id as source_id,
        target_dok_id as target_id,
        relation_type,
        relation_subtype,
        source_field,
        null as target_type_hint,
        parliamentary_session as target_rm_hint,
        null as target_beteckning_hint,
        document_title as target_title_hint,
        null as source_array_length,
        null as source_array_index,
        intressent_id,
        null as vote_choice,
        null as vote_subject,
        null as vote_description,
        parliamentary_session,
        speech_timestamp as timestamp
    from {{ ref('int_document_edges_speech') }}
),
votes as (
    select
        votering_id as source_id,
        target_dok_id as target_id,
        relation_type,
        relation_subtype,
        source_field,
        null as target_type_hint,
        parliamentary_session as target_rm_hint,
        beteckning as target_beteckning_hint,
        null as target_title_hint,
        null as source_array_length,
        null as source_array_index,
        intressent_id,
        vote_choice,
        vote_subject,
        vote_description,
        parliamentary_session,
        vote_timestamp as timestamp
    from {{ ref('int_document_edges_vote') }}
)

select * from refs
union all
select * from persons
union all
select * from speeches
union all
select * from votes

