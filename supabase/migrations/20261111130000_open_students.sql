-- Сурагч багшийн кодгүйгээр зөвхөн нэр, ангиа бичээд сорил өгнө.
-- Бүх (нэвтэрсэн) багш бүх сурагч, дүн, сорилыг харж, устгаж чадна — ангиар нь шүүж үзнэ.
-- Кодгүй илгээсэн сурагчийн teacher_id = null («эзэнгүй»). Хуучин ?code= холбоос ажилласаар, тэр багшид оноогдоно.

alter table public.students alter column teacher_id drop not null;
alter table public.records alter column teacher_id drop not null;
alter table public.diag_submissions alter column teacher_id drop not null;

-- ---------- students ----------
drop policy if exists "students: own or admin select" on public.students;
drop policy if exists "students: own or admin update" on public.students;
drop policy if exists "students: own or admin delete" on public.students;
create policy "students: teachers select all" on public.students
  for select to authenticated using (true);
create policy "students: teachers update all" on public.students
  for update to authenticated using (true) with check (true);
create policy "students: teachers delete all" on public.students
  for delete to authenticated using (true);

-- ---------- records ----------
drop policy if exists "records: own or admin select" on public.records;
drop policy if exists "records: own or admin delete" on public.records;
drop policy if exists "records: own insert" on public.records;
create policy "records: teachers select all" on public.records
  for select to authenticated using (true);
create policy "records: own insert" on public.records
  for insert to authenticated
  with check (teacher_id = (select auth.uid()) and exists (select 1 from public.students s where s.id = records.student_id));
create policy "records: teachers delete all" on public.records
  for delete to authenticated using (true);

-- ---------- diag_submissions ----------
drop policy if exists "diag: own or admin select" on public.diag_submissions;
drop policy if exists "diag: own or admin delete" on public.diag_submissions;
drop policy if exists "diag: own insert" on public.diag_submissions;
create policy "diag: teachers select all" on public.diag_submissions
  for select to authenticated using (true);
create policy "diag: own insert" on public.diag_submissions
  for insert to authenticated
  with check (teacher_id = (select auth.uid()) and exists (select 1 from public.students s where s.id = diag_submissions.student_id));
create policy "diag: teachers delete all" on public.diag_submissions
  for delete to authenticated using (true);

-- ---------- Сурагчийн сорил илгээх: код заавал биш ----------
create or replace function public.submit_diagnostic(
  p_code text, p_name text, p_cls text, p_answers smallint[], p_self smallint[], p_scores jsonb, p_date date
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  t_id uuid;
  s_id text;
  n text := regexp_replace(trim(coalesce(p_name, '')), '\s+', ' ', 'g');
  c text := trim(coalesce(p_cls, ''));
  d date := coalesce(p_date, current_date);
  item jsonb;
begin
  -- Код өгвөл тэр багшид оноогдоно; кодгүй / буруу код бол эзэнгүй (бүх багш харна)
  if nullif(trim(coalesce(p_code, '')), '') is not null then
    select id into t_id from public.teachers where code = upper(trim(p_code));
  end if;

  if char_length(n) not between 1 and 60 or char_length(c) not between 1 and 10 then
    raise exception 'invalid_student' using errcode = 'P0001';
  end if;
  if cardinality(p_answers) not between 1 and 100
     or exists (select 1 from unnest(p_answers) v where v is null or v not between -1 and 9) then
    raise exception 'invalid_answers' using errcode = 'P0001';
  end if;
  if cardinality(p_self) > 10 or exists (select 1 from unnest(p_self) v where v is null or v not between 0 and 4) then
    raise exception 'invalid_self' using errcode = 'P0001';
  end if;
  if jsonb_typeof(p_scores) <> 'array' or jsonb_array_length(p_scores) > 10 then
    raise exception 'invalid_scores' using errcode = 'P0001';
  end if;
  -- Цагийн бүсийн зөрүүг (Монгол UTC+8) зөвшөөрнө
  if d not between current_date - 1 and current_date + 1 then d := current_date; end if;

  -- Ижил нэр, ангитай сурагч байвал түүн рүү нэмнэ (аль багшийнх ч бай)
  select id into s_id from public.students
   where lower(name) = lower(n) and lower(cls) = lower(c)
   order by (teacher_id is not distinct from t_id) desc, created_at
   limit 1;
  if s_id is null then
    insert into public.students (teacher_id, name, cls) values (t_id, n, c) returning id into s_id;
  end if;

  insert into public.diag_submissions (teacher_id, student_id, answers, self, date)
  values (t_id, s_id, p_answers, coalesce(p_self, '{}'), d);

  for item in select * from jsonb_array_elements(p_scores) loop
    insert into public.records (teacher_id, student_id, task, level, score, date)
    values (t_id, s_id, left(item ->> 'task', 200), 'Онош', (item ->> 'score')::smallint, d);
  end loop;
end $$;
