import { NextResponse } from "next/server"
import { z } from "zod"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { checkRateLimitAsync, getClientIp } from "@/lib/rate-limit"

const schema = z.object({
  code: z.string().min(1).transform((s) => s.trim().toUpperCase()),
  subtotal: z.number().nonnegative(),
})

export async function POST(req: Request) {
  const ip = getClientIp(req)
  const rl = await checkRateLimitAsync({ key: `promo:${ip}`, limit: 20, windowMs: 60_000 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez plus tard." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const supabase = createPublicServerClient()
  const { data, error } = await supabase.rpc("validate_promo", {
    code_in: parsed.data.code,
    subtotal_in: Number(parsed.data.subtotal),
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const row = Array.isArray(data) ? data[0] : null
  if (!row) return NextResponse.json({ valid: false, reason: "not_found" })
  if (!row.valid) return NextResponse.json({ valid: false, reason: row.reason ?? "invalid" })

  return NextResponse.json({
    valid: true,
    code: row.code,
    discount: Number(row.discount ?? 0),
  })
}

