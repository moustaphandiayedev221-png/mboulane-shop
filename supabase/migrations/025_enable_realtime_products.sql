-- Active Supabase Realtime (postgres_changes) pour la table products.
-- Supabase utilise généralement la publication "supabase_realtime".
-- Cette migration est idempotente.

do $$
begin
  -- Pour UPDATE/DELETE, Realtime peut avoir besoin d'anciennes valeurs;
  -- FULL évite les soucis si la table n'a pas de clé primaire adéquate pour l'identification.
  execute 'alter table public.products replica identity full';
exception
  when undefined_table then
    -- Table pas encore créée dans cet environnement.
    null;
end $$;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    -- Ajoute la table à la publication si elle n'y est pas déjà.
    execute 'alter publication supabase_realtime add table public.products';
  elsif exists (select 1 from pg_publication where pubname = 'realtime') then
    -- Fallback (anciens projets / config différente).
    execute 'alter publication realtime add table public.products';
  else
    raise notice 'Aucune publication Realtime trouvée (supabase_realtime/realtime). Activez Realtime dans Supabase.';
  end if;
exception
  when duplicate_object then
    -- Déjà présent dans la publication.
    null;
end $$;

