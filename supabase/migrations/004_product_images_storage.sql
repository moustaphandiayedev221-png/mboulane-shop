-- MBOULANE SHOP : préparation migration images vers Supabase Storage
-- Objectif : permettre de stocker un "path" Storage (bucket) tout en gardant les URLs actuelles.

alter table public.products
  add column if not exists image_storage_path text,
  add column if not exists images_storage_paths text[] not null default '{}';

create index if not exists products_image_storage_path_idx on public.products (image_storage_path);

