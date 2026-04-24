-- Sous-titres des collections (légende cursive sur le visuel, maquette Nos Collections)

alter table public.categories
  add column if not exists subtitle text;

update public.categories
set subtitle = 'Élégance Intemporelle'
where label = 'Classique';

update public.categories
set subtitle = 'Style et Élégance'
where label = 'Mode & Tendance';

update public.categories
set subtitle = 'Raffinement Élevé'
where label = 'Premium';

update public.categories
set subtitle = 'Savoir-Faire Authentique'
where label = 'Artisanal & Unique';
