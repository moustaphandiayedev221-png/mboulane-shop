-- MBOULANE SHOP : clients + promotions + paramètres (type Shopify-lite)

-- 1) Clients (profil simplifié basé sur commandes)
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  email text not null unique,
  first_name text,
  last_name text,
  phone text,
  city text,
  address text,
  last_order_id text,
  last_order_at timestamptz,
  orders_count int not null default 0,
  total_spent numeric not null default 0
);

create index if not exists customers_updated_at_idx on public.customers (updated_at);
create index if not exists customers_total_spent_idx on public.customers (total_spent);

alter table public.customers enable row level security;
drop policy if exists "customers_select_admin_only" on public.customers;
-- Pas de policy : lecture/écriture via service_role uniquement (API admin)

-- updated_at trigger (réutilise set_updated_at si déjà présent)
do $$
begin
  if not exists (select 1 from pg_proc where proname = 'set_updated_at') then
    create function public.set_updated_at()
    returns trigger
    language plpgsql
    as $fn$
    begin
      new.updated_at = now();
      return new;
    end;
    $fn$;
  end if;
end$$;

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

-- 2) Promotions (codes promo)
create table if not exists public.promo_codes (
  code text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  active boolean not null default true,
  description text,
  type text not null check (type in ('percent','fixed')),
  value numeric not null check (value >= 0),
  min_subtotal numeric not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit int,
  used_count int not null default 0
);

create index if not exists promo_codes_active_idx on public.promo_codes (active);

alter table public.promo_codes enable row level security;
-- Lecture publique possible via endpoint serveur (on garde RLS fermé)

drop trigger if exists promo_codes_set_updated_at on public.promo_codes;
create trigger promo_codes_set_updated_at
before update on public.promo_codes
for each row execute function public.set_updated_at();

-- 3) Settings supplémentaires (clés attendues)
-- site_settings est créé en 005 ; ici on seed des defaults si absent.
insert into public.site_settings(key, value)
values
  ('checkout', jsonb_build_object(
    'freeShippingThreshold', 50000,
    'deliveryZones', jsonb_build_array(
      jsonb_build_object('name','Dakar','price',2000,'time','1 à 2 jours ouvrables'),
      jsonb_build_object('name','Thiès','price',3500,'time','2-3 jours'),
      jsonb_build_object('name','Saint-Louis','price',3500,'time','3-4 jours'),
      jsonb_build_object('name','Autres régions','price',4000,'time','4-5 jours')
    )
  )),
  ('content', jsonb_build_object(
    'promoBanner', jsonb_build_object(
      'enabled', true,
      'text', '10% de réduction — Code: MBOULANE10',
      'dismissable', true
    )
  ))
on conflict (key) do nothing;

