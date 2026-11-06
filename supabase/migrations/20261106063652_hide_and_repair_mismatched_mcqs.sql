do $$
declare
  t record;
begin
  -- Subject-specific mirror tables share the same column layout because the
  -- sync trigger copies rows with SELECT *. Keep every MCQ table aligned.
  for t in
    select tablename
    from pg_tables
    where schemaname = 'public' and tablename like 'mcqs%'
  loop
    execute format(
      'alter table public.%I add column if not exists is_hidden boolean not null default false',
      t.tablename
    );
  end loop;
end $$;

update public.mcqs
set question = 'Which country was the subject of the United Nations Security Council resolution adopted on 21 December 2022?'
where id = 71232;

update public.mcqs
set question = 'Speech act theory was primarily developed by which philosopher?',
    explanation = 'Speech act theory was primarily developed by British philosopher J. L. Austin. He introduced the theory in his 1955 lectures, later published as How to Do Things with Words. American philosopher John Searle subsequently expanded on Austin’s work.'
where id = 71422;

update public.mcqs
set question = 'Which position did Joe Biden hold under President Barack Obama from 2009 to 2017?',
    explanation = 'Joe Biden served as Vice President of the United States under President Barack Obama from 2009 to 2017.'
where id = 71242;

update public.mcqs
set question = 'Which global issue did Al Gore and the Intergovernmental Panel on Climate Change highlight when they received the 2007 Nobel Peace Prize?',
    explanation = 'Al Gore and the Intergovernmental Panel on Climate Change shared the 2007 Nobel Peace Prize for raising awareness of human-caused climate change and its effects.'
where id = 71186;

update public.mcqs
set is_hidden = true
where id in (71104, 71261, 71264, 71285, 71406, 71411, 71421, 71481, 71535, 71549, 71649, 71694, 71696, 71882);
