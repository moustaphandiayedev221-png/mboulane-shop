-- MBOULANE SHOP : liaison commandes -> clients + promo

alter table public.orders
  add column if not exists customer_id uuid references public.customers (id) on delete set null,
  add column if not exists promo_code text,
  add column if not exists discount numeric not null default 0;

create index if not exists orders_customer_id_idx on public.orders (customer_id);
create index if not exists orders_promo_code_idx on public.orders (promo_code);

