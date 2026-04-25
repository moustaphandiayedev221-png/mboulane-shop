-- Statistiques visiteurs (approximation "unique/jour") + pageviews.
-- Stockage minimal: aucun IP en clair, seulement un hash côté serveur.

create table if not exists public.daily_visits (
  day date primary key,
  visits int not null default 0,
  uniques int not null default 0
);

create table if not exists public.daily_pageviews (
  day date not null,
  path text not null,
  views int not null default 0,
  primary key (day, path)
);

alter table public.daily_visits enable row level security;
alter table public.daily_pageviews enable row level security;

-- Lecture uniquement via service_role (admin via API serveur).

create or replace function public.record_visit(p_path text, p_visitor_hash text)
returns void
language plpgsql
as $$
declare
  d date := (now() at time zone 'utc')::date;
  inserted_unique boolean := false;
begin
  -- Compteur "uniques" (1 par visiteur/jour) via table temporaire interne.
  -- On ne garde pas la table de mapping au-delà de la journée.
  create table if not exists public.daily_unique_visitors (
    day date not null,
    visitor_hash text not null,
    primary key (day, visitor_hash)
  );
  alter table public.daily_unique_visitors enable row level security;

  begin
    insert into public.daily_unique_visitors(day, visitor_hash) values (d, p_visitor_hash);
    inserted_unique := true;
  exception when unique_violation then
    inserted_unique := false;
  end;

  insert into public.daily_visits(day, visits, uniques)
  values (d, 1, case when inserted_unique then 1 else 0 end)
  on conflict (day) do update
    set visits = public.daily_visits.visits + 1,
        uniques = public.daily_visits.uniques + case when inserted_unique then 1 else 0 end;

  if p_path is not null and p_path <> '' then
    insert into public.daily_pageviews(day, path, views)
    values (d, left(p_path, 300), 1)
    on conflict (day, path) do update
      set views = public.daily_pageviews.views + 1;
  end if;
end;
$$;

revoke all on function public.record_visit(text, text) from public;
grant execute on function public.record_visit(text, text) to service_role;

