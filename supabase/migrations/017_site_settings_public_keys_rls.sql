-- Restreint la lecture anon/authenticated aux clés explicitement publiques.
-- Les clés internes ne doivent pas être ajoutées sans mise à jour de lib/site/public-setting-keys.ts

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
      'about_page'
    )
  );
