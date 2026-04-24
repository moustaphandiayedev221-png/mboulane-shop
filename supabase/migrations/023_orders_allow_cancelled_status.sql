-- Allow cancelled orders status.
-- We keep a simple CHECK constraint (text column) for flexibility.

alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (status in ('confirmée', 'préparation', 'expédiée', 'livrée', 'annulée'));

