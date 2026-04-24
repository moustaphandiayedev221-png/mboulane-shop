import { createClient } from "@supabase/supabase-js"

/**
 * Client "public" côté serveur, sans cookies.
 * À utiliser pour les lectures au build time (generateStaticParams, sitemap, etc.).
 */
export function createPublicServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error("Variables NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY manquantes")
  }

  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

