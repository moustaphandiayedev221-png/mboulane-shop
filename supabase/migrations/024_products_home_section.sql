-- Ajout d'une section d'affichage sur la page d'accueil.
-- Valeurs possibles (null = non affiché en section dédiée) :
-- 'best_sellers' | 'premium_luxe' | 'nouveautes' | 'collection_artisanale'

alter table public.products
  add column if not exists home_section text;

alter table public.products
  drop constraint if exists products_home_section_check;

alter table public.products
  add constraint products_home_section_check
  check (
    home_section is null
    or home_section in ('best_sellers', 'premium_luxe', 'nouveautes', 'collection_artisanale')
  );

create index if not exists products_home_section_idx on public.products (home_section);

