-- MBOULANE SHOP : panier + wishlist (100% Supabase, multi-appareils)
-- Dépendances : 001_catalog_and_orders.sql (products) + auth.users (Supabase Auth)

-- PANIER
create table if not exists public.cart_items (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  size int not null,
  color text not null,
  quantity int not null check (quantity > 0),
  unique (user_id, product_id, size, color)
);

create index if not exists cart_items_user_id_idx on public.cart_items (user_id);
create index if not exists cart_items_product_id_idx on public.cart_items (product_id);

-- WISHLIST
create table if not exists public.wishlist_items (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  unique (user_id, product_id)
);

create index if not exists wishlist_items_user_id_idx on public.wishlist_items (user_id);
create index if not exists wishlist_items_product_id_idx on public.wishlist_items (product_id);

-- updated_at auto
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cart_items_set_updated_at on public.cart_items;
create trigger cart_items_set_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

-- RLS
alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;

-- Cart policies (authenticated only)
drop policy if exists "cart_select_own" on public.cart_items;
create policy "cart_select_own"
  on public.cart_items
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "cart_insert_own" on public.cart_items;
create policy "cart_insert_own"
  on public.cart_items
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "cart_update_own" on public.cart_items;
create policy "cart_update_own"
  on public.cart_items
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "cart_delete_own" on public.cart_items;
create policy "cart_delete_own"
  on public.cart_items
  for delete
  to authenticated
  using (user_id = auth.uid());

-- Wishlist policies (authenticated only)
drop policy if exists "wishlist_select_own" on public.wishlist_items;
create policy "wishlist_select_own"
  on public.wishlist_items
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "wishlist_insert_own" on public.wishlist_items;
create policy "wishlist_insert_own"
  on public.wishlist_items
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "wishlist_delete_own" on public.wishlist_items;
create policy "wishlist_delete_own"
  on public.wishlist_items
  for delete
  to authenticated
  using (user_id = auth.uid());

