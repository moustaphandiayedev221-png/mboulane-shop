-- MBOULANE SHOP : RPC KPIs / timeseries pour dashboard admin

-- KPIs sur une période
create or replace function public.orders_kpis(from_ts timestamptz, to_ts timestamptz)
returns table (
  revenue numeric,
  orders_count int,
  discount_total numeric,
  promo_orders_count int
)
language sql
stable
as $$
  select
    coalesce(sum(o.total), 0)::numeric as revenue,
    coalesce(count(*), 0)::int as orders_count,
    coalesce(sum(coalesce(o.discount, 0)), 0)::numeric as discount_total,
    coalesce(count(*) filter (where o.promo_code is not null and length(o.promo_code) > 0), 0)::int as promo_orders_count
  from public.orders o
  where o.created_at >= from_ts
    and o.created_at < to_ts;
$$;

-- Série journalière sur N jours (inclus aujourd'hui)
create or replace function public.orders_timeseries_daily(days_back int)
returns table (
  day date,
  revenue numeric,
  orders_count int
)
language sql
stable
as $$
  with days as (
    select generate_series(
      (current_date - (greatest(days_back, 1) - 1))::date,
      current_date::date,
      interval '1 day'
    )::date as day
  )
  select
    d.day,
    coalesce(sum(o.total), 0)::numeric as revenue,
    coalesce(count(o.id), 0)::int as orders_count
  from days d
  left join public.orders o
    on o.created_at >= d.day::timestamptz
   and o.created_at < (d.day + 1)::timestamptz
  group by d.day
  order by d.day asc;
$$;

