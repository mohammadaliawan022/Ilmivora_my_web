-- Add official syllabus-aligned subjects and their dedicated MCQ tables.
-- PPSC syllabuses vary by post; FPSC and NTS subject lists also depend on test type.
insert into public.subjects (slug, name)
values
  ('general-ability', 'General Ability'),
  ('analytical-reasoning', 'Analytical Reasoning'),
  ('quantitative-reasoning', 'Quantitative Reasoning'),
  ('verbal-reasoning', 'Verbal Reasoning'),
  ('general-science-and-ability', 'General Science and Ability'),
  ('english-essay', 'English Essay'),
  ('english-precis-and-composition', 'English Precis and Composition'),
  ('comparative-study-of-major-religions', 'Comparative Study of Major Religions'),
  ('accountancy-and-auditing', 'Accountancy and Auditing'),
  ('applied-mathematics', 'Applied Mathematics'),
  ('pure-mathematics', 'Pure Mathematics'),
  ('geology', 'Geology'),
  ('business-administration', 'Business Administration'),
  ('governance-and-public-policies', 'Governance and Public Policies'),
  ('town-planning-and-urban-management', 'Town Planning and Urban Management'),
  ('history-of-pakistan-and-india', 'History of Pakistan and India'),
  ('islamic-history-and-culture', 'Islamic History and Culture'),
  ('british-history', 'British History'),
  ('european-history', 'European History'),
  ('history-of-usa', 'History of USA'),
  ('gender-studies', 'Gender Studies'),
  ('environmental-sciences', 'Environmental Sciences'),
  ('agriculture-and-forestry', 'Agriculture and Forestry'),
  ('constitutional-law', 'Constitutional Law'),
  ('international-law', 'International Law'),
  ('muslim-law-and-jurisprudence', 'Muslim Law and Jurisprudence'),
  ('mercantile-law', 'Mercantile Law'),
  ('criminology', 'Criminology'),
  ('mass-communication', 'Mass Communication'),
  ('anthropology', 'Anthropology'),
  ('punjabi', 'Punjabi'),
  ('pashto', 'Pashto'),
  ('balochi', 'Balochi'),
  ('persian', 'Persian'),
  ('arabic', 'Arabic'),
  ('agriculture-economics', 'Agriculture Economics'),
  ('agriculture-extension', 'Agriculture Extension'),
  ('agriculture-crop-production', 'Agriculture Crop Production'),
  ('agriculture-crop-protection', 'Agriculture Crop Protection'),
  ('agriculture-food-sciences', 'Agriculture Food Sciences'),
  ('agriculture-plant-genetics', 'Agriculture Plant Genetics'),
  ('architecture', 'Architecture'),
  ('biochemistry', 'Biochemistry'),
  ('bioinformatics', 'Bioinformatics'),
  ('biotechnology', 'Biotechnology'),
  ('computer-engineering', 'Computer Engineering'),
  ('education', 'Education'),
  ('electronics', 'Electronics'),
  ('english-linguistics', 'English Linguistics'),
  ('fine-arts', 'Fine Arts'),
  ('forestry-and-range-management', 'Forestry and Range Management'),
  ('geography', 'Geography'),
  ('history', 'History'),
  ('home-economics', 'Home Economics'),
  ('human-nutrition', 'Human Nutrition'),
  ('library-and-information-sciences', 'Library and Information Sciences'),
  ('metallurgical-and-material-engineering', 'Metallurgical and Material Engineering'),
  ('meteorology', 'Meteorology'),
  ('microbiology', 'Microbiology'),
  ('brahui', 'Brahui'),
  ('saraiki', 'Saraiki'),
  ('pharmacy', 'Pharmacy'),
  ('remote-sensing-and-gis', 'Remote Sensing and GIS'),
  ('social-anthropology', 'Social Anthropology'),
  ('telecommunication-engineering', 'Telecommunication Engineering'),
  ('textile-engineering', 'Textile Engineering'),
  ('veterinary-animal-sciences', 'Veterinary Animal Sciences'),
  ('veterinary-bio-medical-sciences', 'Veterinary Bio-Medical Sciences'),
  ('veterinary-clinical-sciences', 'Veterinary Clinical Sciences'),
  ('veterinary-patho-biological-sciences', 'Veterinary Patho-Biological Sciences'),
  ('wildlife', 'Wildlife'),
  ('commerce', 'Commerce'),
  ('business-ethics', 'Business Ethics'),
  ('urdu-literature', 'Urdu Literature'),
  ('sindhi', 'Sindhi'),
  ('journalism-and-mass-communication', 'Journalism and Mass Communication')
on conflict (slug) do nothing;

do $$
declare
  subject_slug text;
  table_name text;
  policy_name text;
begin
  foreach subject_slug in array array[
    'general-ability',
    'analytical-reasoning',
    'quantitative-reasoning',
    'verbal-reasoning',
    'general-science-and-ability',
    'english-essay',
    'english-precis-and-composition',
    'comparative-study-of-major-religions',
    'accountancy-and-auditing',
    'applied-mathematics',
    'pure-mathematics',
    'geology',
    'business-administration',
    'governance-and-public-policies',
    'town-planning-and-urban-management',
    'history-of-pakistan-and-india',
    'islamic-history-and-culture',
    'british-history',
    'european-history',
    'history-of-usa',
    'gender-studies',
    'environmental-sciences',
    'agriculture-and-forestry',
    'constitutional-law',
    'international-law',
    'muslim-law-and-jurisprudence',
    'mercantile-law',
    'criminology',
    'mass-communication',
    'anthropology',
    'punjabi',
    'pashto',
    'balochi',
    'persian',
    'arabic',
    'agriculture-economics',
    'agriculture-extension',
    'agriculture-crop-production',
    'agriculture-crop-protection',
    'agriculture-food-sciences',
    'agriculture-plant-genetics',
    'architecture',
    'biochemistry',
    'bioinformatics',
    'biotechnology',
    'computer-engineering',
    'education',
    'electronics',
    'english-linguistics',
    'fine-arts',
    'forestry-and-range-management',
    'geography',
    'history',
    'home-economics',
    'human-nutrition',
    'library-and-information-sciences',
    'metallurgical-and-material-engineering',
    'meteorology',
    'microbiology',
    'brahui',
    'saraiki',
    'pharmacy',
    'remote-sensing-and-gis',
    'social-anthropology',
    'telecommunication-engineering',
    'textile-engineering',
    'veterinary-animal-sciences',
    'veterinary-bio-medical-sciences',
    'veterinary-clinical-sciences',
    'veterinary-patho-biological-sciences',
    'wildlife',
    'commerce',
    'business-ethics',
    'urdu-literature',
    'sindhi',
    'journalism-and-mass-communication'
  ] loop
    table_name := 'mcqs_' || replace(subject_slug, '-', '_');
    execute format(
      'create table if not exists public.%I (like public.mcqs_accounting including all)',
      table_name
    );
    execute format('alter table public.%I enable row level security', table_name);
    execute format('grant select on table public.%I to anon, authenticated', table_name);

    policy_name := table_name || '_public_read';
    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = table_name
        and policyname = policy_name
    ) then
      execute format(
        'create policy %I on public.%I for select to anon, authenticated using (true)',
        policy_name,
        table_name
      );
    end if;
  end loop;
end;
$$;

