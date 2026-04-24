import { createClient } from "@/lib/supabase/server"

export function getAllowedAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS
  if (!raw) return []
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export async function assertAdmin() {
  const allowed = getAllowedAdminEmails()
  if (allowed.length === 0) return { ok: false as const, status: 403, error: "Admin désactivé" }

  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const email = data.user?.email?.toLowerCase()
  if (!email) return { ok: false as const, status: 401, error: "Non authentifié" }
  if (!allowed.includes(email)) return { ok: false as const, status: 403, error: "Accès refusé" }
  return { ok: true as const, email }
}

