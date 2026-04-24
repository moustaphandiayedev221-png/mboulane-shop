/** Présent sur les requêtes si `lib/supabase/middleware` a propagé `x-request-id`. */
export function getRequestId(req: Request): string {
  const h = req.headers.get("x-request-id")?.trim()
  if (h && h.length > 0) return h
  return crypto.randomUUID()
}
