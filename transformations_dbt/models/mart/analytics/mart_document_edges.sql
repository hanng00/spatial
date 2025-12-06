-- Mart: Document edges passthrough
-- Exposes the unified edge list for graph/search use

select
    source_id,
    target_id,
    relation_type,
    relation_subtype,
    source_field,
    target_type_hint,
    target_rm_hint,
    target_beteckning_hint,
    target_title_hint,
    source_array_length,
    source_array_index,
    intressent_id,
    vote_choice,
    vote_subject,
    vote_description,
    parliamentary_session,
    timestamp
from {{ ref('int_document_edges') }}

