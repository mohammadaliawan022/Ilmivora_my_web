create or replace function public.get_random_mcqs(
  p_subject text default null,
  p_subjects text[] default null,
  p_topics text[] default null,
  p_exam_category text default null,
  p_search text default null,
  p_include_hidden boolean default false,
  p_count integer default 10
)
returns setof public.mcqs
language sql
volatile
security invoker
set search_path = ''
as $$
  select m.*
  from public.mcqs as m
  where (p_include_hidden or m.is_hidden = false)
    and (p_subject is null or lower(m.subject) = lower(p_subject))
    and (
      coalesce(cardinality(p_subjects), 0) = 0
      or lower(m.subject) = any (
        array(select lower(s.value) from unnest(p_subjects) as s(value))
      )
    )
    and (
      coalesce(cardinality(p_topics), 0) = 0
      or lower(m.topic) = any (
        array(select lower(t.value) from unnest(p_topics) as t(value))
      )
    )
    and (
      p_exam_category is null
      or lower(coalesce(m.exam_category, '')) = lower(p_exam_category)
    )
    and (
      p_search is null
      or btrim(p_search) = ''
      or concat_ws(' ', m.question, m.option_a, m.option_b, m.option_c, m.option_d, m.subject)
        ilike '%' || p_search || '%'
    )
  order by random()
  limit greatest(0, least(coalesce(p_count, 10), 100));
$$;

revoke all on function public.get_random_mcqs(text, text[], text[], text, text, boolean, integer) from public;
grant execute on function public.get_random_mcqs(text, text[], text[], text, text, boolean, integer) to anon, authenticated;

notify pgrst, 'reload schema';
