-- Force payment_method to cash_on_delivery at DB level.
-- Migration safe for existing rows (maps legacy values then adds CHECK constraint).

alter table public.orders
  drop constraint if exists orders_payment_method_cash_on_delivery_only;

update public.orders
set payment_method = 'cash_on_delivery'
where payment_method is distinct from 'cash_on_delivery';

alter table public.orders
  add constraint orders_payment_method_cash_on_delivery_only
  check (payment_method = 'cash_on_delivery');

