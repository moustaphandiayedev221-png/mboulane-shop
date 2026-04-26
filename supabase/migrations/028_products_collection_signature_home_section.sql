-- Ajoute une nouvelle valeur de section d’accueil pour des pages “collection” dédiées.
-- 'collection_signature' n'est pas utilisée par les sections automatiques de la home,
-- mais sert à filtrer la boutique via ?homeSection=collection_signature.

alter table public.products
  drop constraint if exists products_home_section_check;

alter table public.products
  add constraint products_home_section_check
  check (
    home_section is null
    or home_section in (
      'best_sellers',
      'premium_luxe',
      'nouveautes',
      'collection_artisanale',
      'collection_signature'
    )
  );

