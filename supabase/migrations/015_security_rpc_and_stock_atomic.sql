-- MBOULANE SHOP : sécurité endpoints publics + stock atomique + promo RPC
--
-- Si la base a déjà une version « allégée » de validate_promo (ex. après 016),
-- CREATE OR REPLACE seul échoue : « cannot change return type of existing function ».
-- create_order_from_checkout (016) référence validate_promo / decrement_stock / consume_promo :
-- les retirer d’abord pour pouvoir recréer les RPC dans n’importe quel ordre de rejouage.
drop function if exists public.create_order_from_checkout(jsonb);
drop function if exists public.deployment_health();
drop function if exists public.validate_promo(text, numeric);
drop function if exists public.consume_promo(text);
drop function if exists public.decrement_stock(text, int);

-- 1) RPC : validation promo (retourne uniquement champs sûrs)
create or replace function public.validate_promo(code_in text, subtotal_in numeric)
returns table (
  valid boolean,
  reason text,
  code text,
  type text,
  value numeric,
  discount numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  p public.promo_codes%rowtype;
  now_ts timestamptz := now();
  subtotal numeric := greatest(0, coalesce(subtotal_in, 0));
  disc numeric := 0;
begin
  select * into p
  from public.promo_codes
  where promo_codes.code = upper(trim(code_in))
  limit 1;

  if not found then
    return query select false, 'not_found', null, null, null, 0;
    return;
  end if;

  if p.active is not true then
    return query select false, 'inactive', p.code, p.type, p.value, 0;
    return;
  end if;

  if p.starts_at is not null and now_ts < p.starts_at then
    return query select false, 'not_started', p.code, p.type, p.value, 0;
    return;
  end if;

  if p.ends_at is not null and now_ts > p.ends_at then
    return query select false, 'expired', p.code, p.type, p.value, 0;
    return;
  end if;

  if p.usage_limit is not null and p.used_count >= p.usage_limit then
    return query select false, 'limit_reached', p.code, p.type, p.value, 0;
    return;
  end if;

  if subtotal < coalesce(p.min_subtotal, 0) then
    return query select false, 'min_subtotal', p.code, p.type, p.value, 0;
    return;
  end if;

  if p.type = 'percent' then
    disc := round((subtotal * p.value) / 100);
  else
    disc := round(p.value);
  end if;

  disc := least(disc, subtotal);
  return query select true, null, p.code, p.type, p.value, disc;
end;
$$;

revoke all on function public.validate_promo(text, numeric) from public;
grant execute on function public.validate_promo(text, numeric) to anon, authenticated;

-- 2) RPC : consommer un code promo (incrément atomique avec vérifications)
create or replace function public.consume_promo(code_in text)
returns table (ok boolean, reason text, code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  now_ts timestamptz := now();
  c text := upper(trim(code_in));
  updated promo_codes%rowtype;
begin
  if c is null or c = '' then
    return query select false, 'empty', null;
    return;
  end if;

  update public.promo_codes pc
  set used_count = pc.used_count + 1, updated_at = now_ts
  where pc.code = c
    and pc.active is true
    and (pc.starts_at is null or now_ts >= pc.starts_at)
    and (pc.ends_at is null or now_ts <= pc.ends_at)
    and (pc.usage_limit is null or pc.used_count < pc.usage_limit)
  returning * into updated;

  if not found then
    return query select false, 'not_consumed', c;
    return;
  end if;

  return query select true, null, updated.code;
end;
$$;

revoke all on function public.consume_promo(text) from public;
-- Exécution réservée au serveur (service_role), pas au client
grant execute on function public.consume_promo(text) to service_role;

-- 3) RPC : décrément stock atomique (échoue si insuffisant)
create or replace function public.decrement_stock(product_id_in text, qty_in int)
returns table (ok boolean, remaining int)
language plpgsql
security definer
set search_path = public
as $$
declare
  q int := greatest(0, coalesce(qty_in, 0));
  rem int;
begin
  if q <= 0 then
    return query select true, null;
    return;
  end if;

  update public.products p
  set stock_quantity = case
    when p.stock_quantity is null then null
    else greatest(0, p.stock_quantity - q)
  end,
  updated_at = now()
  where p.id = product_id_in
    and (p.stock_quantity is null or p.stock_quantity >= q)
  returning p.stock_quantity into rem;

  if not found then
    return query select false, null;
    return;
  end if;

  return query select true, rem;
end;
$$;

revoke all on function public.decrement_stock(text, int) from public;
grant execute on function public.decrement_stock(text, int) to service_role;

