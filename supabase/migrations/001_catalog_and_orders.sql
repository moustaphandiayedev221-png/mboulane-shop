-- MBOULANE SHOP : catalogue + commandes (service role pour orders)
-- Automatique : DATABASE_URL dans .env.local puis `npm run db:migrate`
-- Ou : Supabase SQL Editor / `supabase db push`

create table if not exists public.categories (
  id serial primary key,
  label text unique not null,
  sort_order int not null default 0
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  price numeric not null,
  original_price numeric,
  image text not null,
  images text[] not null default '{}',
  description text not null,
  category text not null,
  sizes int[] not null default '{}',
  colors text[] not null default '{}',
  in_stock boolean not null default true,
  badge text,
  rating numeric not null default 0,
  review_count int not null default 0,
  sort_order int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_sort_idx on public.products (sort_order);

create table if not exists public.color_swatches (
  color_name text primary key,
  hex_value text not null
);

create table if not exists public.customer_reviews (
  id text primary key,
  name text not null,
  location text not null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text not null,
  review_date text not null,
  verified boolean not null default false,
  sort_order int not null default 0
);

create table if not exists public.orders (
  id text primary key,
  created_at timestamptz default now(),
  email text not null,
  first_name text not null,
  last_name text not null,
  phone text not null,
  city text not null,
  address text not null,
  notes text,
  payment_method text not null,
  subtotal numeric not null,
  delivery_fee numeric not null,
  total numeric not null,
  status text not null check (
    status in ('confirmée', 'préparation', 'expédiée', 'livrée')
  )
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id text not null references public.orders (id) on delete cascade,
  product_id text not null,
  name text not null,
  image text not null,
  quantity int not null,
  size int not null,
  color text not null,
  unit_price numeric not null
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- RLS : lecture publique du catalogue ; commandes réservées au service role
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.color_swatches enable row level security;
alter table public.customer_reviews enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "categories_select_anon" on public.categories;
create policy "categories_select_anon" on public.categories for select to anon, authenticated using (true);

drop policy if exists "products_select_anon" on public.products;
create policy "products_select_anon" on public.products for select to anon, authenticated using (true);

drop policy if exists "color_swatches_select_anon" on public.color_swatches;
create policy "color_swatches_select_anon" on public.color_swatches for select to anon, authenticated using (true);

drop policy if exists "customer_reviews_select_anon" on public.customer_reviews;
create policy "customer_reviews_select_anon" on public.customer_reviews for select to anon, authenticated using (true);

-- Pas de policy SELECT sur orders / order_items → anon ne voit rien (service_role bypass)
