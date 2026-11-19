-- اعلان‌های پنل مدیریت + شمارندهٔ بی‌نام بازدید
-- اعمال‌شده روی پروژهٔ Supabase با ref: xobowqanviucymqampre (2026-11-19)
-- این فایل برای بازتولید دستی/بازبینی است؛ منبع حقیقت همان پایگاه‌دادهٔ مستقرشده است.

create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  body text not null default '',
  ref_table text not null check (ref_table in ('consultations','comments')),
  ref_id uuid,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists admin_notifications_unread_idx on public.admin_notifications (read) where not read;
create index if not exists admin_notifications_created_idx on public.admin_notifications (created_at desc);

create table if not exists public.visit_stats (
  day date not null,
  path text not null,
  views bigint not null default 0,
  primary key (day, path)
);

alter table public.admin_notifications enable row level security;
alter table public.visit_stats enable row level security;

create policy "admin notifications read" on public.admin_notifications for select to authenticated using (true);
create policy "admin notifications update" on public.admin_notifications for update to authenticated using (true) with check (true);
create policy "visit stats admin read" on public.visit_stats for select to authenticated using (true);

create or replace function public.notify_on_consultation_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.admin_notifications (type, title, body, ref_table, ref_id)
  values (
    'consultation_new',
    'درخواست مشاورهٔ جدید',
    coalesce(new.name, '—') || ' — موضوع: ' || coalesce(new.topic, '—'),
    'consultations',
    new.id
  );
  return new;
end $$;

create or replace function public.notify_on_comment_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.admin_notifications (type, title, body, ref_table, ref_id)
  values (
    'comment_new',
    'دیدگاه جدید در انتظار تأیید',
    'مقاله: ' || coalesce(new.article_slug, '—') || ' — نویسنده: ' || coalesce(new.author_name, '—'),
    'comments',
    new.id
  );
  return new;
end $$;

drop trigger if exists trg_notify_consultation on public.consultations;
create trigger trg_notify_consultation
  after insert on public.consultations
  for each row execute function public.notify_on_consultation_insert();

drop trigger if exists trg_notify_comment on public.comments;
create trigger trg_notify_comment
  after insert on public.comments
  for each row execute function public.notify_on_comment_insert();

create or replace function public.record_visit(p_path text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  cleaned text := left(regexp_replace(coalesce(p_path, ''), '[?#].*$', ''), 128);
begin
  if cleaned = '' then return; end if;
  if cleaned !~ '^/[A-Za-z0-9._~/%-]*$' then return; end if;
  insert into public.visit_stats (day, path, views)
  values (current_date, cleaned, 1)
  on conflict (day, path) do update set views = visit_stats.views + 1;
end $$;

grant execute on function public.record_visit(text) to anon;
grant execute on function public.record_visit(text) to authenticated;
