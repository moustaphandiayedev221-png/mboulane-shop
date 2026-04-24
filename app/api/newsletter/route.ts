import { NextResponse } from "next/server"
import { z } from "zod"
import { createServiceRoleClient } from "@/lib/supabase/admin"
import { checkRateLimitAsync, getClientIp } from "@/lib/rate-limit"
import { logError, logInfo } from "@/lib/log"
import { getRequestId } from "@/lib/request-id"

const schema = z.object({
  email: z.string().email(),
  source: z.string().optional(),
})

export async function POST(req: Request) {
  const requestId = getRequestId(req)
  const ip = getClientIp(req)
  const rl = await checkRateLimitAsync({ key: `newsletter:${ip}`, limit: 10, windowMs: 60_000 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez plus tard." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec), "x-request-id": requestId } },
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

  const supabase = createServiceRoleClient()
  const email = parsed.data.email.trim().toLowerCase()
  const { error } = await supabase.from("newsletter_subscribers").upsert(
    {
      email,
      source: parsed.data.source || "site",
      subscribed: true,
    },
    { onConflict: "email", ignoreDuplicates: false },
  )

  if (error) {
    logError("newsletter.upsert_failed", { ip, email, error: error.message }, requestId)
    return NextResponse.json({ error: error.message }, { status: 500, headers: { "x-request-id": requestId } })
  }

  logInfo("newsletter.subscribed", { ip, email }, requestId)
  return NextResponse.json({ ok: true }, { headers: { "x-request-id": requestId } })
}

