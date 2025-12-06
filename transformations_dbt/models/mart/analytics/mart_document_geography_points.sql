-- Mart: Document geography points (doc -> district/person/party)

select
    dok_id,
    document_date,
    document_year,
    document_month,
    document_title,
    document_type,
    document_category,
    committee,
    parliamentary_session,
    intressent_id,
    role,
    electoral_district,
    party,
    explicit_location,
    published_date,
    submitted_date,
    debate_date,
    decision_date
from {{ ref('int_document_geography') }}

