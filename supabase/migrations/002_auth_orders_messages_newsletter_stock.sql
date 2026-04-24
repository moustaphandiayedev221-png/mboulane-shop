-- Extension MBOULANE SHOP : auth + commandes + messages + newsletter + stock
-- À exécuter après 001_catalog_and_orders.sql

-- 1) Lier les commandes à l'utilisateur Supabase (optionnel pour checkout invité)
alter table public.orders
  add column if not exists user_id uuid references auth.users (id) on delete set null;

create index if not exists orders_user_id_idx on public.orders (user_id);

-- 2) Stock (simple) : quantité globale par produit
alter table public.products
  add column if not exists stock_quantity int;

create index if not exists products_stock_qty_idx on public.products (stock_quantity);

-- 3) Messages contact
create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null
);

-- 4) Newsletter
create table if not exists public.newsletter_subscribers (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  email text not null unique,
  source text not null default 'site',
  subscribed boolean not null default true
);

-- 5) RLS : commandes lisibles uniquement par leur propriétaire
-- NB : service_role bypass RLS, donc insertion via API serveur sans policy permissive.
alter table public.contact_messages enable row level security;
alter table public.newsletter_subscribers enable row level security;

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
  on public.orders
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own"
  on public.order_items
  for select
  to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  ));

-- 6) Newsletter : on autorise l'inscription publique (insert) si vous voulez utiliser le client direct.
-- Ici on garde la possibilité, même si l'app utilise une API route.
drop policy if exists "newsletter_insert_anon" on public.newsletter_subscribers;
create policy "newsletter_insert_anon"
  on public.newsletter_subscribers
  for insert
  to anon, authenticated
  with check (true);

-- 7) Contact : on autorise l'envoi public (insert).
drop policy if exists "contact_insert_anon" on public.contact_messages;
create policy "contact_insert_anon"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

