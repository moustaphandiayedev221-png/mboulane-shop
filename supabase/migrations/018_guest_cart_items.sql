-- Panier invité (sans auth.users) : persistance serveur liée à un cookie opaque côté app (API service role).

create table if not exists public.guest_cart_items (
  guest_token uuid not null,
  product_id text not null references public.products (id) on delete cascade,
  size int not null,
  color text not null,
  quantity int not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (guest_token, product_id, size, color)
);

create index if not exists guest_cart_items_token_idx on public.guest_cart_items (guest_token);

drop trigger if exists guest_cart_items_set_updated_at on public.guest_cart_items;
create trigger guest_cart_items_set_updated_at
before update on public.guest_cart_items
for each row execute function public.set_updated_at();

alter table public.guest_cart_items enable row level security;
-- Aucune policy : accès uniquement via service_role (Route Handlers Next).
