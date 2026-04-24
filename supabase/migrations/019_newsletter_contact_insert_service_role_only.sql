-- Inserts newsletter / contact uniquement via service role (API Next.js).
-- Évite le spam direct sur la base avec la clé anon (policy INSERT ouverte).
-- Dépendances : 002_auth_orders_messages_newsletter_stock.sql

drop policy if exists "newsletter_insert_anon" on public.newsletter_subscribers;
drop policy if exists "contact_insert_anon" on public.contact_messages;

-- Aucune policy INSERT pour anon/authenticated : le client serveur utilise SUPABASE_SERVICE_ROLE_KEY (contourne RLS).
