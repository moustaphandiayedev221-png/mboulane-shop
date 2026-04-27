-- Expose la clé des chiffres « Avis clients » (accueil) en lecture publique.
drop policy if exists "site_settings_select_anon" on public.site_settings;

create policy "site_settings_select_anon"
  on public.site_settings
  for select
  to anon, authenticated
  using (
    key in (
      'hero',
      'checkout',
      'content',
      'home_artisanal',
      'home_why_choose',
      'home_reviews_stats',
      'about_page',
      'contact_page'
    )
  );
