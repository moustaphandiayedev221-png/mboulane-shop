import { NextResponse } from "next/server"
import { z } from "zod"
import { createServiceRoleClient } from "@/lib/supabase/admin"
import { checkRateLimitAsync, getClientIp } from "@/lib/rate-limit"
import { logError, logInfo } from "@/lib/log"
import { getRequestId } from "@/lib/request-id"

const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  subject: z.string().min(1),
  message: z.string().min(10),
})

export async function POST(req: Request) {
  const requestId = getRequestId(req)
  const ip = getClientIp(req)
  const rl = await checkRateLimitAsync({ key: `contact:${ip}`, limit: 6, windowMs: 60_000 })
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
  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name.trim(),
    email: parsed.data.email.trim().toLowerCase(),
    phone: parsed.data.phone?.trim() || null,
    subject: parsed.data.subject,
    message: parsed.data.message.trim(),
  })

  if (error) {
    logError("contact.insert_failed", { ip, error: error.message }, requestId)
    return NextResponse.json({ error: error.message }, { status: 500, headers: { "x-request-id": requestId } })
  }

  logInfo("contact.inserted", { ip, email: parsed.data.email.trim().toLowerCase() }, requestId)
  return NextResponse.json({ ok: true }, { headers: { "x-request-id": requestId } })
}

