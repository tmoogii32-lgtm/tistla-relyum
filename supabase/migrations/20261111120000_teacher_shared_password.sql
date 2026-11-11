-- Бүх багш өөр өөрийн и-мэйлээр, харин НЭГ нийтлэг нууц үгээр нэвтэрнэ.
-- И-мэйл илгээх (баталгаажуулах, нууц үг сэргээх) шаардлагагүй. Админ бүртгэлд хамаарахгүй.
-- Нийтлэг нууц үг энд биш — мэдээллийн санд bcrypt хэлбэрээр private.teacher_password-д хадгалагдана.
-- Нууц үг солих: админаар нэвтэрсэн үед  select public.admin_set_teacher_password('шинэ нууц үг');
--   эсвэл SQL Editor-т доорх «Нууц үг анх тохируулах / солих» хэсгийг ажиллуулна.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.teacher_password (
  id boolean primary key default true check (id), -- ганц мөр
  hash text not null,
  updated_at timestamptz not null default now()
);
revoke all on private.teacher_password from public, anon, authenticated;

/*
 * Нийтлэг нууц үг зөв бол багшийн бүртгэлийг нэвтрэхэд бэлдэнэ:
 *   - бүртгэлгүй и-мэйл → баталгаажсан бүртгэл үүсгэнэ
 *   - бүртгэлтэй и-мэйл → нууц үгийг нийтлэг болгож, баталгаажсан гэж тэмдэглэнэ
 * Дараа нь браузер signInWithPassword-оор ердийнхөөрөө нэвтэрнэ.
 * Алдааны мессеж: not_configured | bad_email | wrong_shared_password | admin_account
 */
create or replace function public.teacher_prepare_login(p_email text, p_password text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_hash text;
  v_id uuid;
begin
  select hash into v_hash from private.teacher_password where id;
  if v_hash is null then raise exception 'not_configured' using errcode = 'P0001'; end if;
  if length(v_email) > 254 or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'bad_email' using errcode = 'P0001';
  end if;
  if p_password is null or extensions.crypt(p_password, v_hash) <> v_hash then
    raise exception 'wrong_shared_password' using errcode = 'P0001';
  end if;

  select u.id into v_id from auth.users u where lower(u.email) = v_email and not u.is_sso_user limit 1;

  if v_id is null then
    v_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
      extensions.crypt(p_password, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(),
      '', '', '', ''
    );
    insert into auth.identities (user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
    values (
      v_id, v_id::text, 'email',
      jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true, 'phone_verified', false),
      now(), now(), now()
    );
  else
    if exists (select 1 from public.admins a where a.user_id = v_id) then
      raise exception 'admin_account' using errcode = 'P0001';
    end if;
    update auth.users
       set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           updated_at = now()
     where id = v_id;
  end if;
end $$;

/* Админ: нийтлэг нууц үгийг солино — бүх багшийн (админаас бусад) нууц үг шууд шинэ болж, хуучин нь ажиллахаа больно */
create or replace function public.admin_set_teacher_password(p_password text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_password is null or length(p_password) < 8 then raise exception 'too_short' using errcode = 'P0001'; end if;
  insert into private.teacher_password (id, hash) values (true, extensions.crypt(p_password, extensions.gen_salt('bf', 10)))
  on conflict (id) do update set hash = excluded.hash, updated_at = now();
  update auth.users u
     set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
         email_confirmed_at = coalesce(u.email_confirmed_at, now()),
         updated_at = now()
   where not exists (select 1 from public.admins a where a.user_id = u.id);
end $$;

revoke all on function public.teacher_prepare_login(text, text) from public;
revoke all on function public.admin_set_teacher_password(text) from public, anon;
grant execute on function public.teacher_prepare_login(text, text) to anon, authenticated;
grant execute on function public.admin_set_teacher_password(text) to authenticated;

-- ---------- Нууц үг анх тохируулах / солих (SQL Editor-т, '<нууц үг>'-г сольж ажиллуулна) ----------
-- insert into private.teacher_password (id, hash) values (true, extensions.crypt('<нууц үг>', extensions.gen_salt('bf', 10)))
-- on conflict (id) do update set hash = excluded.hash, updated_at = now();
-- update auth.users u set encrypted_password = extensions.crypt('<нууц үг>', extensions.gen_salt('bf')),
--        email_confirmed_at = coalesce(u.email_confirmed_at, now()), updated_at = now()
--  where not exists (select 1 from public.admins a where a.user_id = u.id);
