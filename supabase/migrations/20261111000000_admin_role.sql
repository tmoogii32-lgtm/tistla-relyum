-- Админ: бүх багшийн сурагч, дүн, сорилыг харж, засна. Одоогоор ганц админ: tmoogii32@gmail.com
-- Supabase Dashboard → SQL Editor-т бүтнээр нь хуулж ажиллуулна (нэг л удаа).

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
revoke all on public.admins from anon;
create policy "admins: self select" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

insert into public.admins (user_id)
select id from auth.users where email = 'tmoogii32@gmail.com'
on conflict do nothing;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Багшийн (өөрийн) эсвэл админы эрхтэй нэг policy болгон нэгтгэнэ
drop policy "students: own select" on public.students;
drop policy "students: own update" on public.students;
drop policy "students: own delete" on public.students;
create policy "students: own or admin select" on public.students
  for select to authenticated using (teacher_id = (select auth.uid()) or (select public.is_admin()));
create policy "students: own or admin update" on public.students
  for update to authenticated
  using (teacher_id = (select auth.uid()) or (select public.is_admin()))
  with check (teacher_id = (select auth.uid()) or (select public.is_admin()));
create policy "students: own or admin delete" on public.students
  for delete to authenticated using (teacher_id = (select auth.uid()) or (select public.is_admin()));

drop policy "records: own select" on public.records;
drop policy "records: own delete" on public.records;
create policy "records: own or admin select" on public.records
  for select to authenticated using (teacher_id = (select auth.uid()) or (select public.is_admin()));
create policy "records: admin update" on public.records
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "records: own or admin delete" on public.records
  for delete to authenticated using (teacher_id = (select auth.uid()) or (select public.is_admin()));

drop policy "diag: own select" on public.diag_submissions;
drop policy "diag: own delete" on public.diag_submissions;
create policy "diag: own or admin select" on public.diag_submissions
  for select to authenticated using (teacher_id = (select auth.uid()) or (select public.is_admin()));
create policy "diag: admin update" on public.diag_submissions
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "diag: own or admin delete" on public.diag_submissions
  for delete to authenticated using (teacher_id = (select auth.uid()) or (select public.is_admin()));

drop policy "teachers: own select" on public.teachers;
create policy "teachers: own or admin select" on public.teachers
  for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));

-- Админд: багш нарын жагсаалт (и-мэйл нь auth.users-д тул security definer)
create function public.admin_teachers()
returns table (id uuid, email text, code text, is_admin boolean, created_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  return query
    select u.id, u.email::text, t.code, (a.user_id is not null), u.created_at
    from auth.users u
    left join public.teachers t on t.id = u.id
    left join public.admins a on a.user_id = u.id
    order by u.created_at;
end $$;

-- Админ эрх олгох / хасах (өөрийгөө хасахгүй)
create function public.admin_set_admin(p_user uuid, p_on boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_user = auth.uid() and not p_on then raise exception 'cannot_remove_self' using errcode = 'P0001'; end if;
  if p_on then
    insert into public.admins (user_id) values (p_user) on conflict do nothing;
  else
    delete from public.admins where user_id = p_user;
  end if;
end $$;

revoke all on function public.admin_teachers() from public, anon;
revoke all on function public.admin_set_admin(uuid, boolean) from public, anon;
grant execute on function public.admin_teachers() to authenticated;
grant execute on function public.admin_set_admin(uuid, boolean) to authenticated;
