ALTER TABLE public.mcqs
  ADD COLUMN IF NOT EXISTS submitter_name text;

CREATE OR REPLACE FUNCTION public.approve_mcq_submission(p_submission_id uuid, p_edits jsonb DEFAULT NULL::jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  submission_row public.mcq_submissions%rowtype;
  published_id bigint;
begin
  select * into submission_row
  from public.mcq_submissions
  where id = p_submission_id and status = 'pending'
  for update;

  if not found then
    raise exception 'Submission not found or already reviewed';
  end if;

  insert into public.mcqs (
    question, option_a, option_b, option_c, option_d, correct_answer,
    explanation, subject, exam_category, topic, submitter_name
  ) values (
    case when p_edits ? 'question' then p_edits->>'question' else submission_row.question end,
    case when p_edits ? 'option_a' then p_edits->>'option_a' else submission_row.option_a end,
    case when p_edits ? 'option_b' then p_edits->>'option_b' else submission_row.option_b end,
    case when p_edits ? 'option_c' then p_edits->>'option_c' else submission_row.option_c end,
    case when p_edits ? 'option_d' then p_edits->>'option_d' else submission_row.option_d end,
    case when p_edits ? 'correct_answer' then p_edits->>'correct_answer' else submission_row.correct_answer end,
    case when p_edits ? 'explanation' then p_edits->>'explanation' else submission_row.explanation end,
    case when p_edits ? 'subject' then p_edits->>'subject' else submission_row.subject end,
    case when p_edits ? 'exam_category' then p_edits->>'exam_category' else submission_row.exam_category end,
    case when p_edits ? 'topic' then p_edits->>'topic' else submission_row.topic end,
    submission_row.submitter_name
  ) returning id into published_id;

  update public.mcq_submissions
  set status = 'approved',
      reviewed_at = now(),
      published_mcq_id = published_id
  where id = p_submission_id;

  return published_id;
end;
$function$;
