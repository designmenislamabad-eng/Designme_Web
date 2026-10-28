-- Supabase Auth securely manages auth.users, password hashes, sessions, and recovery tokens.
-- Do not create a custom login/password/reset-token table or write directly to auth.users.
-- After creating the admin in Authentication > Users, this read-only query can verify it:
-- select id, email, email_confirmed_at from auth.users
-- where lower(email) = 'designmenislamabad@gmail.com';

create table if not exists public.admin_email_challenges (
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  code_hash text not null,
  attempts integer not null default 0 check (attempts between 0 and 5),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  primary key (user_id, session_id)
);

create table if not exists public.admin_mfa_sessions (
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  verified_at timestamptz not null default now(),
  expires_at timestamptz not null,
  primary key (user_id, session_id)
);

alter table public.admin_email_challenges enable row level security;
alter table public.admin_mfa_sessions enable row level security;
revoke all on public.admin_email_challenges, public.admin_mfa_sessions from anon, authenticated;
grant all on public.admin_email_challenges, public.admin_mfa_sessions to service_role;

create or replace function public.store_admin_email_challenge(
  p_user_id uuid,
  p_session_id text,
  p_code_hash text,
  p_expires_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  challenge_saved boolean;
begin
  insert into public.admin_email_challenges (user_id, session_id, code_hash, attempts, created_at, expires_at)
  values (p_user_id, p_session_id, p_code_hash, 0, now(), p_expires_at)
  on conflict (user_id, session_id) do update
    set code_hash = excluded.code_hash,
        attempts = 0,
        created_at = now(),
        expires_at = excluded.expires_at
    where public.admin_email_challenges.created_at <= now() - interval '1 minute'
  returning true into challenge_saved;

  return coalesce(challenge_saved, false);
end;
$$;

create or replace function public.record_admin_email_attempt(p_user_id uuid, p_session_id text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  with updated as (
    update public.admin_email_challenges
    set attempts = attempts + 1
    where user_id = p_user_id
      and session_id = p_session_id
      and attempts < 5
      and expires_at > now()
    returning 1
  )
  select exists (select 1 from updated);
$$;

create or replace function public.consume_admin_email_challenge(
  p_user_id uuid,
  p_session_id text,
  p_code_hash text
)
returns boolean
language sql
security definer
set search_path = ''
as $$
  with consumed as (
    delete from public.admin_email_challenges
    where user_id = p_user_id
      and session_id = p_session_id
      and code_hash = p_code_hash
      and attempts < 5
      and expires_at > now()
    returning 1
  )
  select exists (select 1 from consumed);
$$;

revoke all on function public.record_admin_email_attempt(uuid, text) from public, anon, authenticated;
revoke all on function public.consume_admin_email_challenge(uuid, text, text) from public, anon, authenticated;
revoke all on function public.store_admin_email_challenge(uuid, text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.record_admin_email_attempt(uuid, text) to service_role;
grant execute on function public.consume_admin_email_challenge(uuid, text, text) to service_role;
grant execute on function public.store_admin_email_challenge(uuid, text, text, timestamptz) to service_role;

create or replace function public.is_designmen_admin_mfa_verified()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'designmenislamabad@gmail.com'
    and exists (
      select 1
      from public.admin_mfa_sessions as verified
      where verified.user_id = auth.uid()
        and verified.session_id = (auth.jwt() ->> 'session_id')
        and verified.expires_at > now()
    );
$$;

revoke all on function public.is_designmen_admin_mfa_verified() from public, anon;
grant execute on function public.is_designmen_admin_mfa_verified() to authenticated;

create table if not exists public.site_content (
  id text primary key check (id = 'homepage'),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

drop policy if exists "Public can read homepage content" on public.site_content;
create policy "Public can read homepage content"
  on public.site_content for select
  using (id = 'homepage');

drop policy if exists "Only designated admin can insert homepage content" on public.site_content;
create policy "Only designated admin can insert homepage content"
  on public.site_content for insert
  to authenticated
  with check (
    id = 'homepage'
    and public.is_designmen_admin_mfa_verified()
  );

drop policy if exists "Only designated admin can update homepage content" on public.site_content;
create policy "Only designated admin can update homepage content"
  on public.site_content for update
  to authenticated
  using (public.is_designmen_admin_mfa_verified())
  with check (
    id = 'homepage'
    and public.is_designmen_admin_mfa_verified()
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-assets', 'site-assets', true, 26214400, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view website images" on storage.objects;
drop policy if exists "Public can view website media" on storage.objects;
drop policy if exists "Only designated admin can view website media" on storage.objects;
create policy "Public can view website media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'site-assets');

drop policy if exists "Only designated admin can upload website images" on storage.objects;
drop policy if exists "Only designated admin can upload website media" on storage.objects;
create policy "Only designated admin can upload website media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'site-assets'
    and public.is_designmen_admin_mfa_verified()
  );

drop policy if exists "Only designated admin can update website images" on storage.objects;
drop policy if exists "Only designated admin can update website media" on storage.objects;
create policy "Only designated admin can update website media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'site-assets'
    and public.is_designmen_admin_mfa_verified()
  )
  with check (
    bucket_id = 'site-assets'
    and public.is_designmen_admin_mfa_verified()
  );

drop policy if exists "Only designated admin can delete website images" on storage.objects;
drop policy if exists "Only designated admin can delete website media" on storage.objects;
create policy "Only designated admin can delete website media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'site-assets'
    and public.is_designmen_admin_mfa_verified()
  );