create or replace function public.get_mcq_subject_counts()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(jsonb_object_agg(counts.subject, counts.total), '{}'::jsonb)
  from (
    select m.subject, count(*) as total
    from public.mcqs as m
    where coalesce(m.is_hidden, false) = false
    group by m.subject
  ) as counts;
$$;

create or replace function public.get_mcq_exam_category_counts()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(jsonb_object_agg(counts.exam_category, counts.total), '{}'::jsonb)
  from (
    select coalesce(m.exam_category, 'Other') as exam_category, count(*) as total
    from public.mcqs as m
    where coalesce(m.is_hidden, false) = false
    group by coalesce(m.exam_category, 'Other')
  ) as counts;
$$;

revoke all on function public.get_mcq_subject_counts() from public, anon, authenticated;
revoke all on function public.get_mcq_exam_category_counts() from public, anon, authenticated;
grant execute on function public.get_mcq_subject_counts() to anon, authenticated;
grant execute on function public.get_mcq_exam_category_counts() to anon, authenticated;
