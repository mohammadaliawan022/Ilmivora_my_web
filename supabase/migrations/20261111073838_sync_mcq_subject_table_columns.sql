create or replace function public.sync_mcq_subject_table()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  old_subject_table text;
  new_subject_table text;
  old_slug text;
  new_slug text;
begin
  if tg_op <> 'INSERT' then
    old_slug := lower(regexp_replace(lower(btrim(old.subject)), '[^a-z0-9]+', '-', 'g'));
    select 'mcqs_' || replace(s.slug, '-', '_')
      into old_subject_table
      from public.subjects s
      where s.slug = old_slug;
  end if;

  if tg_op <> 'DELETE' then
    new_slug := lower(regexp_replace(lower(btrim(new.subject)), '[^a-z0-9]+', '-', 'g'));
    select 'mcqs_' || replace(s.slug, '-', '_')
      into new_subject_table
      from public.subjects s
      where s.slug = new_slug;
  end if;

  if tg_op = 'DELETE' or old_subject_table is distinct from new_subject_table then
    if old_subject_table is not null then
      execute format('delete from public.%I where id = $1', old_subject_table)
        using old.id;
    end if;
  end if;

  if tg_op <> 'DELETE' and new_subject_table is not null then
    execute format('delete from public.%I where id = $1', new_subject_table)
      using new.id;
    execute format(
      'insert into public.%I (
        id, created_at, question, option_a, option_b, option_c, option_d,
        correct_answer, explanation, subject, exam_category, topic, submitter_name, is_hidden
      )
      select
        id, created_at, question, option_a, option_b, option_c, option_d,
        correct_answer, explanation, subject, exam_category, topic, submitter_name, is_hidden
      from public.mcqs where id = $1',
      new_subject_table
    ) using new.id;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$function$;
