-- Нууц үг сэргээх (Багш + Админ). Migration биш — шаардлагатай үед SQL Editor-т гараар ажиллуулна.
-- Supabase Dashboard → SQL Editor → энэ файлыг бүтнээр нь хуулна → доорх 3 утгыг сольж → Run.
--
-- Юу хийх вэ:
--   1. Админы бүртгэл байхгүй бол үүсгэж, нууц үгийг нь шинэчилнэ, баталгаажсан гэж тэмдэглэнэ.
--   2. Админыг public.admins-д заавал оруулна (ингэснээр админы нууц үг багшийн нийтлэг нууц үгээр дахин дарагдахгүй).
--   3. Багшийн нийтлэг нууц үгийг тохируулж, бүх багшийн (админаас бусад) нууц үгийг шинэ нийтлэг нууц үг болгоно.
-- Нууц үг энэ файлд хадгалагдахгүй — ажиллуулсны дараа SQL Editor-оос устгана уу.

do $$
declare
  -- ▼▼▼ ЭДГЭЭРИЙГ СОЛЬНО ▼▼▼
  v_admin_email    text := 'tmoogii32@gmail.com';
  v_admin_password text := '<АДМИНЫ ШИНЭ НУУЦ ҮГ>';
  v_teacher_password text := '<БАГШИЙН НИЙТЛЭГ НУУЦ ҮГ>';
  -- ▲▲▲
  v_id uuid;
begin
  if v_admin_password like '<%' or v_teacher_password like '<%' then
    raise exception 'Нууц үгийн утгуудыг (<...>) сольж бичнэ үү.';
  end if;
  if length(v_admin_password) < 3 then raise exception 'Админы нууц үг хамгийн багадаа 3 тэмдэгт.'; end if;
  -- Нэвтрэхэд Supabase уртыг шалгахгүй (зөвхөн бүртгүүлэх/солиход), тиймээс 3 тэмдэгт ажиллана
  if length(v_teacher_password) < 3 then raise exception 'Багшийн нийтлэг нууц үг хамгийн багадаа 3 тэмдэгт.'; end if;
  if v_admin_password = v_teacher_password then raise exception 'Админы нууц үг багшийн нийтлэг нууц үгээс өөр байх ёстой.'; end if;

  v_admin_email := lower(trim(v_admin_email));

  -- 1. Админы бүртгэл
  select id into v_id from auth.users where lower(email) = v_admin_email and not is_sso_user limit 1;
  if v_id is null then
    v_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_admin_email,
      extensions.crypt(v_admin_password, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(),
      '', '', '', ''
    );
    insert into auth.identities (user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
    values (
      v_id, v_id::text, 'email',
      jsonb_build_object('sub', v_id::text, 'email', v_admin_email, 'email_verified', true, 'phone_verified', false),
      now(), now(), now()
    );
  else
    update auth.users
       set encrypted_password = extensions.crypt(v_admin_password, extensions.gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           banned_until = null,
           updated_at = now()
     where id = v_id;
  end if;

  -- 2. Админы эрх
  insert into public.admins (user_id) values (v_id) on conflict do nothing;

  -- 3. Багшийн нийтлэг нууц үг + бүх багшийн нууц үг
  insert into private.teacher_password (id, hash)
  values (true, extensions.crypt(v_teacher_password, extensions.gen_salt('bf', 10)))
  on conflict (id) do update set hash = excluded.hash, updated_at = now();

  update auth.users u
     set encrypted_password = extensions.crypt(v_teacher_password, extensions.gen_salt('bf')),
         email_confirmed_at = coalesce(u.email_confirmed_at, now()),
         updated_at = now()
   where not exists (select 1 from public.admins a where a.user_id = u.id);

  raise notice 'Бэлэн: админ (%) болон бүх багшийн нууц үг шинэчлэгдлээ.', v_admin_email;
end $$;

-- Шалгах: админ, багш нарын жагсаалт
select u.email, (a.user_id is not null) as is_admin, u.email_confirmed_at is not null as confirmed, u.last_sign_in_at
from auth.users u
left join public.admins a on a.user_id = u.id
order by is_admin desc, u.email;
