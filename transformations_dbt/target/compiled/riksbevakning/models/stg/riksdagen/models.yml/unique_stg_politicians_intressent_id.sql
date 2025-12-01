
    
    

select
    intressent_id as unique_field,
    count(*) as n_records

from "analytics"."main_stg"."stg_politicians"
where intressent_id is not null
group by intressent_id
having count(*) > 1


