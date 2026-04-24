-- MBOULANE SHOP : images catégories (picker admin)

alter table public.categories
  add column if not exists image text,
  add column if not exists image_storage_path text;

create index if not exists categories_sort_idx on public.categories (sort_order);

