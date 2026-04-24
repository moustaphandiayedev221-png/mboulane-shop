-- MBOULANE SHOP : settings site (Hero) pour back-office

create table if not exists public.site_settings (
  key text primary key,
  updated_at timestamptz not null default now(),
  value jsonb not null default '{}'::jsonb
);

alter table public.site_settings enable row level security;

-- lecture publique (hero côté site)
drop policy if exists "site_settings_select_anon" on public.site_settings;
create policy "site_settings_select_anon"
  on public.site_settings
  for select
  to anon, authenticated
  using (true);

