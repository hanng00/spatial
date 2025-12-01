-- Staging model for dokumentlista (documents)
-- Raw passthrough - only source abstraction layer
-- Business logic belongs in int layer
-- Using SELECT * to include all columns that exist in source table

select *
from {{ source('raw_riksdagen', 'dokumentlista') }}
