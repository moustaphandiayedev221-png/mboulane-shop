-- Avis par produit (type Shopify) + recalcul des stats produits.

create table if not exists public.product_reviews (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  product_id text not null references public.products (id) on delete cascade,
  name text not null,
  email text,
  rating int not null check (rating >= 1 and rating <= 5),
  title text,
  comment text not null,
  approved boolean not null default false,
  source text not null default 'site',
  ip_hash text
);

create index if not exists product_reviews_product_id_idx on public.product_reviews (product_id);
create index if not exists product_reviews_approved_idx on public.product_reviews (approved);
create index if not exists product_reviews_created_at_idx on public.product_reviews (created_at);

alter table public.product_reviews enable row level security;

-- Lecture publique uniquement des avis approuvés.
drop policy if exists "product_reviews_select_approved" on public.product_reviews;
create policy "product_reviews_select_approved"
  on public.product_reviews
  for select
  to anon, authenticated
  using (approved = true);

-- Dépôt public (toujours non approuvé au départ).
drop policy if exists "product_reviews_insert_public" on public.product_reviews;
create policy "product_reviews_insert_public"
  on public.product_reviews
  for insert
  to anon, authenticated
  with check (approved = false);

-- Aucune policy update/delete publique (modération via service_role).

-- Recalcul rating/review_count depuis les avis approuvés.
create or replace function public.recompute_product_review_stats(pid text)
returns void
language plpgsql
as $$
declare
  avg_rating numeric;
  cnt int;
begin
  select coalesce(avg(rating)::numeric, 0), coalesce(count(*)::int, 0)
    into avg_rating, cnt
  from public.product_reviews
  where product_id = pid and approved = true;

  update public.products
    set rating = avg_rating,
        review_count = cnt,
        updated_at = now()
  where id = pid;
end;
$$;

create or replace function public.product_reviews_after_change()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT') then
    perform public.recompute_product_review_stats(new.product_id);
    return new;
  elsif (tg_op = 'UPDATE') then
    perform public.recompute_product_review_stats(new.product_id);
    if (old.product_id is distinct from new.product_id) then
      perform public.recompute_product_review_stats(old.product_id);
    end if;
    return new;
  elsif (tg_op = 'DELETE') then
    perform public.recompute_product_review_stats(old.product_id);
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists product_reviews_after_change on public.product_reviews;
create trigger product_reviews_after_change
after insert or update or delete on public.product_reviews
for each row execute function public.product_reviews_after_change();

