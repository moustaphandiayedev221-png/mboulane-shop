import { NextResponse } from "next/server"
import { z } from "zod"
import { createServiceRoleClient } from "@/lib/supabase/admin"
import { checkRateLimitAsync, getClientIp } from "@/lib/rate-limit"
import { getRequestId } from "@/lib/request-id"
import crypto from "crypto"

const schema = z.object({
  path: z.string().min(1).max(300),
})

function hashVisitor(ip: string, ua: string): string {
  const src = `${ip}|${ua}`
  return crypto.createHash("sha256").update(src).digest("hex").slice(0, 40)
}

export async function POST(req: Request) {
  const requestId = getRequestId(req)
  const ip = getClientIp(req)
  const ua = req.headers.get("user-agent") ?? ""

  const rl = await checkRateLimitAsync({
    key: `analytics_visit:${ip}`,
    limit: 30,
    windowMs: 60_000,
  })
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: true },
      { status: 200, headers: { "x-request-id": requestId } },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: true }, { headers: { "x-request-id": requestId } })

  const visitorHash = hashVisitor(ip, ua)
  const supabase = createServiceRoleClient()
  await supabase.rpc("record_visit", { p_path: parsed.data.path, p_visitor_hash: visitorHash })

  return NextResponse.json({ ok: true }, { headers: { "x-request-id": requestId } })
}

