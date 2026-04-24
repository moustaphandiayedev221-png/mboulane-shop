-- MBOULANE SHOP : bucket Supabase Storage pour images site (Hero, catégories, etc.)

insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do update set public = excluded.public;

