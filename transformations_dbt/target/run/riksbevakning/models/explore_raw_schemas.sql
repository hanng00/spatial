
  
  create view "raw"."riksdagen"."explore_raw_schemas__dbt_tmp" as (
    -- Temporary exploration model to understand raw table schemas
-- This will help us identify politician identifiers and touchpoints

select 
    'personlista' as table_name,
    column_name,
    data_type
from information_schema.columns 
where table_schema = 'riksdagen' 
    and table_name = 'personlista'
    and column_name like '%id%' or column_name like '%person%' or column_name like '%intressent%'

union all

select 
    'anforandelista' as table_name,
    column_name,
    data_type
from information_schema.columns 
where table_schema = 'riksdagen' 
    and table_name = 'anforandelista'
    and (column_name like '%id%' or column_name like '%person%' or column_name like '%intressent%' or column_name like '%talare%')

union all

select 
    'voteringlista' as table_name,
    column_name,
    data_type
from information_schema.columns 
where table_schema = 'riksdagen' 
    and table_name = 'voteringlista'
    and (column_name like '%id%' or column_name like '%person%' or column_name like '%intressent%')

union all

select 
    'dokumentlista' as table_name,
    column_name,
    data_type
from information_schema.columns 
where table_schema = 'riksdagen' 
    and table_name = 'dokumentlista'
    and (column_name like '%id%' or column_name like '%person%' or column_name like '%intressent%' or column_name like '%avs%')

order by table_name, column_name
  );
