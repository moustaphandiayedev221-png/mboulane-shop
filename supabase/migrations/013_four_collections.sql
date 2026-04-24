-- MBOULANE SHOP : exactement 4 collections (maquette) + redistribution des produits.
-- Classique | Mode & Tendance | Premium | Artisanal & Unique

-- 1) Garantir les 4 lignes (sort_order maquette) sans écraser une image déjà uploadée
insert into public.categories (label, sort_order, image)
values
  ('Classique', 0, null),
  ('Mode & Tendance', 1, null),
  ('Premium', 2, null),
  ('Artisanal & Unique', 3, null)
on conflict (label) do update set
  sort_order = excluded.sort_order,
  image = coalesce(public.categories.image, excluded.image);

-- 2) Réattribuer chaque produit vers l’une des 4 collections
update public.products
set
  category = case
    when category in (
      'Classique',
      'Mode & Tendance',
      'Premium',
      'Artisanal & Unique'
    ) then category
    when category = 'Elite' then 'Premium'
    when category = 'Artisanal' then 'Artisanal & Unique'
    when category in ('Casual', 'Urban', 'Beach', 'Confort') then 'Mode & Tendance'
    else 'Mode & Tendance'
  end,
  updated_at = now();

-- 3) Supprimer toute autre catégorie
delete from public.categories
where label not in (
  'Classique',
  'Mode & Tendance',
  'Premium',
  'Artisanal & Unique'
);
