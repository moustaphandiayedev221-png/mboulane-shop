-- MBOULANE SHOP : bucket Supabase Storage pour images produits

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

