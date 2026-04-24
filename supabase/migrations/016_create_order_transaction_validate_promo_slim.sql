-- MBOULANE SHOP : commande atomique (order + items + stock + promo) + validate_promo allégé + health

-- Recréation du type de retour de validate_promo (015 → 016) : REPLACE seul est refusé par Postgres.
drop function if exists public.create_order_from_checkout(jsonb);
drop function if exists public.deployment_health();
drop function if exists public.validate_promo(text, numeric);

-- 1) validate_promo : ne renvoie plus type/value (réduit la fuite d’infos)
create function public.validate_promo(code_in text, subtotal_in numeric)
returns table (
  valid boolean,
  reason text,
  code text,
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
    return query select false, 'not_found', null::text, 0::numeric;
    return;
  end if;

  if p.active is not true then
    return query select false, 'inactive', null::text, 0::numeric;
    return;
  end if;

  if p.starts_at is not null and now_ts < p.starts_at then
    return query select false, 'not_started', null::text, 0::numeric;
    return;
  end if;

  if p.ends_at is not null and now_ts > p.ends_at then
    return query select false, 'expired', null::text, 0::numeric;
    return;
  end if;

  if p.usage_limit is not null and p.used_count >= p.usage_limit then
    return query select false, 'limit_reached', null::text, 0::numeric;
    return;
  end if;

  if subtotal < coalesce(p.min_subtotal, 0) then
    return query select false, 'min_subtotal', null::text, 0::numeric;
    return;
  end if;

  if p.type = 'percent' then
    disc := round((subtotal * p.value) / 100);
  else
    disc := round(p.value);
  end if;

  disc := least(disc, subtotal);
  return query select true, null::text, p.code, disc;
end;
$$;

revoke all on function public.validate_promo(text, numeric) from public;
grant execute on function public.validate_promo(text, numeric) to anon, authenticated;

-- 2) Création de commande transactionnelle (service_role uniquement)
create function public.create_order_from_checkout(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id text := nullif(trim(payload->>'order_id'), '');
  v_email text := lower(nullif(trim(payload->>'email'), ''));
  v_first text := nullif(trim(payload->>'first_name'), '');
  v_last text := nullif(trim(payload->>'last_name'), '');
  v_phone text := nullif(trim(payload->>'phone'), '');
  v_city text := nullif(trim(payload->>'city'), '');
  v_address text := nullif(trim(payload->>'address'), '');
  v_notes text := nullif(trim(payload->>'notes'), '');
  v_payment text := nullif(trim(payload->>'payment_method'), '');
  v_user_id uuid := null;
  v_promo text := nullif(upper(trim(payload->>'promo_code')), '');
  v_client_total numeric := greatest(0, coalesce((payload->>'client_total')::numeric, 0));
  v_client_delivery numeric := greatest(0, coalesce((payload->>'client_delivery_fee')::numeric, 0));
  v_subtotal numeric := 0;
  v_delivery numeric := 0;
  v_discount numeric := 0;
  v_total numeric;
  checkout jsonb;
  free_ship numeric;
  zones jsonb;
  zone jsonb;
  zone_price numeric;
  promo_row record;
  v_customer_id uuid;
  items jsonb := coalesce(payload->'items', '[]'::jsonb);
  n int;
  idx int;
  elem jsonb;
  zi int;
  zc int;
  pid text;
  qty int;
  sz int;
  col text;
  pr products%rowtype;
  agg record;
  dec_ok boolean;
  cons_ok boolean;
begin
  if v_order_id is null or length(v_order_id) < 3 then
    return jsonb_build_object('ok', false, 'error', 'invalid_order_id');
  end if;
  if v_email is null or v_first is null or v_last is null or v_phone is null or v_city is null or v_address is null then
    return jsonb_build_object('ok', false, 'error', 'invalid_customer');
  end if;
  if v_payment is null or v_payment not in ('cash_on_delivery') then
    return jsonb_build_object('ok', false, 'error', 'invalid_payment');
  end if;

  if payload ? 'user_id' and nullif(trim(payload->>'user_id'), '') is not null then
    begin
      v_user_id := (payload->>'user_id')::uuid;
    exception when others then
      v_user_id := null;
    end;
  end if;

  if jsonb_typeof(items) <> 'array' or jsonb_array_length(items) < 1 then
    return jsonb_build_object('ok', false, 'error', 'invalid_items');
  end if;
  n := jsonb_array_length(items);

  if exists (select 1 from public.orders o where o.id = v_order_id) then
    return jsonb_build_object('ok', false, 'error', 'order_exists');
  end if;

  -- Sous-total + vérification produits (une ligne panier = une ligne order_items)
  for idx in 0..n - 1 loop
    elem := items->idx;
    pid := nullif(trim(elem->>'product_id'), '');
    qty := greatest(1, coalesce((elem->>'quantity')::int, 0));
    sz := greatest(0, coalesce((elem->>'size')::int, 0));
    col := coalesce(nullif(trim(elem->>'color'), ''), '?');
    if pid is null then
      return jsonb_build_object('ok', false, 'error', 'invalid_line');
    end if;
    select * into pr from public.products p where p.id = pid;
    if not found then
      return jsonb_build_object('ok', false, 'error', 'product_not_found', 'product_id', pid);
    end if;
    v_subtotal := v_subtotal + (pr.price::numeric * qty);
  end loop;

  select s.value into checkout
  from public.site_settings s
  where s.key = 'checkout'
  limit 1;

  free_ship := coalesce((checkout->>'freeShippingThreshold')::numeric, 50000);
  zones := checkout->'deliveryZones';

  if zones is null or jsonb_typeof(zones) <> 'array' or jsonb_array_length(zones) = 0 then
    v_delivery := least(50000, v_client_delivery);
  else
    zone := null;
    zc := jsonb_array_length(zones);
    for zi in 0..zc - 1 loop
      if (zones->zi->>'name') = v_city then
        zone := zones->zi;
        exit;
      end if;
    end loop;
    if zone is null then
      zone := zones->0;
    end if;
    zone_price := greatest(0, coalesce((zone->>'price')::numeric, 0));
    v_delivery := case when v_subtotal >= free_ship then 0 else zone_price end;
  end if;

  if v_promo is not null and length(v_promo) > 0 then
    select * into promo_row from public.validate_promo(v_promo, v_subtotal) limit 1;
    if promo_row.valid is not true then
      return jsonb_build_object('ok', false, 'error', 'promo_invalid', 'reason', promo_row.reason);
    end if;
    v_discount := greatest(0, coalesce(promo_row.discount, 0));
  else
    v_discount := 0;
  end if;

  v_total := greatest(0, v_subtotal + v_delivery - v_discount);

  if abs(v_client_total - v_total) > 1 then
    return jsonb_build_object('ok', false, 'error', 'total_mismatch', 'expected', v_total);
  end if;

  insert into public.customers (
    email, first_name, last_name, phone, city, address,
    last_order_id, last_order_at, orders_count, total_spent
  )
  values (
    v_email, v_first, v_last, v_phone, v_city, v_address,
    v_order_id, now(), 1, v_total
  )
  on conflict (email) do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    phone = excluded.phone,
    city = excluded.city,
    address = excluded.address,
    last_order_id = excluded.last_order_id,
    last_order_at = excluded.last_order_at,
    orders_count = public.customers.orders_count + 1,
    total_spent = public.customers.total_spent + excluded.total_spent
  returning id into v_customer_id;

  insert into public.orders (
    id, user_id, customer_id, email, first_name, last_name, phone, city, address, notes,
    payment_method, subtotal, delivery_fee, promo_code, discount, total, status
  ) values (
    v_order_id, v_user_id, v_customer_id, v_email, v_first, v_last, v_phone, v_city, v_address, v_notes,
    v_payment, v_subtotal, v_delivery,
    case when v_promo is not null and length(v_promo) > 0 then v_promo else null end,
    v_discount, v_total, 'confirmée'
  );

  for idx in 0..n - 1 loop
    elem := items->idx;
    pid := nullif(trim(elem->>'product_id'), '');
    qty := greatest(1, coalesce((elem->>'quantity')::int, 0));
    sz := greatest(0, coalesce((elem->>'size')::int, 0));
    col := coalesce(nullif(trim(elem->>'color'), ''), '?');
    select * into pr from public.products p where p.id = pid;
    insert into public.order_items (order_id, product_id, name, image, quantity, size, color, unit_price)
    values (v_order_id, pid, pr.name, pr.image, qty, sz, col, pr.price::numeric);
  end loop;

  for agg in
    select t.elem->>'product_id' as product_id, sum((t.elem->>'quantity')::int) as q
    from jsonb_array_elements(items) as t(elem)
    group by 1
  loop
    select d.ok into dec_ok from public.decrement_stock(agg.product_id, agg.q::int) d limit 1;
    if dec_ok is not true then
      raise exception 'stock_insufficient' using errcode = 'P0001';
    end if;
  end loop;

  if v_promo is not null and length(v_promo) > 0 then
    select c.ok into cons_ok from public.consume_promo(v_promo) c limit 1;
    if cons_ok is not true then
      raise exception 'promo_consume_failed' using errcode = 'P0001';
    end if;
  end if;

  return jsonb_build_object('ok', true, 'id', v_order_id);
end;
$$;

revoke all on function public.create_order_from_checkout(jsonb) from public;
grant execute on function public.create_order_from_checkout(jsonb) to service_role;

-- 3) Vérif déploiement (RPC présentes)
create function public.deployment_health()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'validate_promo', exists(
      select 1 from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'validate_promo'
    ),
    'consume_promo', exists(
      select 1 from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'consume_promo'
    ),
    'decrement_stock', exists(
      select 1 from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'decrement_stock'
    ),
    'create_order_from_checkout', exists(
      select 1 from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'create_order_from_checkout'
    )
  );
$$;

revoke all on function public.deployment_health() from public;
grant execute on function public.deployment_health() to anon, authenticated, service_role;
