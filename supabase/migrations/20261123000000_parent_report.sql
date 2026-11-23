-- Эцэг эхийн тайлан: сурагч бүрт таамаглах боломжгүй нууц токен (parent_token).
-- Багш /etseg-eh?t=<токен> холбоосыг эцэг эхэд илгээнэ; эцэг эх нэвтрэлгүйгээр зөвхөн
-- тухайн сурагчийн онош, нөхөх төлөвлөгөө, даалгаврын дүнг харна (parent_report функцээр л).
-- Холбоос буруу хүнд очвол багш токеныг шинэчилж хуучин холбоосыг хүчингүй болгоно.
-- Supabase Dashboard → SQL Editor-т бүтнээр нь хуулж ажиллуулна (нэг л удаа).

-- Байгаа сурагч бүрт тус тусдаа санамсаргүй утга оноогдоно
alter table public.students
  add column if not exists parent_token uuid not null default gen_random_uuid();
create unique index if not exists students_parent_token_key on public.students (parent_token);

create or replace function public.parent_report(p_token text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  tok uuid;
  s record;
begin
  begin
    tok := p_token::uuid;
  exception when invalid_text_representation then
    return null;
  end;

  select id, name, cls into s from public.students where parent_token = tok;
  if not found then return null; end if;

  return jsonb_build_object(
    'name', s.name,
    'cls', s.cls,
    'records', coalesce((
      select jsonb_agg(jsonb_build_object('task', r.task, 'level', r.level, 'score', r.score, 'date', r.date, 'created_at', r.created_at)
                       order by r.created_at)
      from public.records r where r.student_id = s.id
    ), '[]'::jsonb),
    'diag', coalesce((
      select jsonb_agg(jsonb_build_object('answers', d.answers, 'self', d.self, 'date', d.date) order by d.created_at)
      from public.diag_submissions d where d.student_id = s.id
    ), '[]'::jsonb)
  );
end $$;

revoke all on function public.parent_report(text) from public;
grant execute on function public.parent_report(text) to anon, authenticated;
