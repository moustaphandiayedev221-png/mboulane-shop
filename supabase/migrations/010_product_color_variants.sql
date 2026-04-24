-- MBOULANE SHOP : variantes couleur -> images associées

alter table public.products
  add column if not exists color_variants jsonb not null default '[]'::jsonb;

