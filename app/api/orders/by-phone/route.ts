import { NextResponse } from "next/server"
import { z } from "zod"
import { createServiceRoleClient } from "@/lib/supabase/admin"
import { checkRateLimitAsync, getClientIp } from "@/lib/rate-limit"
import { getRequestId } from "@/lib/request-id"

const schema = z.object({
  phone: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
})

function normalizePhoneDigits(v: string): string {
  return v.replace(/\D/g, "")
}

function normalizeName(v: string): string {
  return v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
}

type OrderStatus = "confirmée" | "préparation" | "expédiée" | "livrée"

type OrderListRow = {
  id: string
  created_at: string
  status: OrderStatus
  total: number
}

export async function POST(req: Request) {
  const requestId = getRequestId(req)
  const ip = getClientIp(req)
  const rl = await checkRateLimitAsync({ key: `orders_by_phone:${ip}`, limit: 18, windowMs: 60_000 })
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
      { status: 400, headers: { "x-request-id": requestId } },
    )
  }

  const phoneDigits = normalizePhoneDigits(parsed.data.phone)
  const firstName = normalizeName(parsed.data.firstName)
  const lastName = normalizeName(parsed.data.lastName)
  if (phoneDigits.length < 6 || !firstName || !lastName) {
    return NextResponse.json(
      { error: "Données invalides." },
      { status: 400, headers: { "x-request-id": requestId } },
    )
  }

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("orders")
    .select("id, created_at, phone, first_name, last_name, status, total")
    .order("created_at", { ascending: false })
    .limit(25)

  if (error) {
    return NextResponse.json({ error: "Service indisponible." }, { status: 503, headers: { "x-request-id": requestId } })
  }

  const matches: OrderListRow[] = []
  for (const row of (data ?? []) as Array<{ id: string; created_at: string; phone?: string | null; first_name?: string | null; last_name?: string | null; status?: string | null; total?: number | null }>) {
    const rowPhone = normalizePhoneDigits(String(row.phone ?? ""))
    const rowFirst = normalizeName(String(row.first_name ?? ""))
    const rowLast = normalizeName(String(row.last_name ?? ""))
    if (rowPhone && rowPhone === phoneDigits && rowFirst === firstName && rowLast === lastName) {
      matches.push({
        id: row.id,
        created_at: row.created_at,
        status: String(row.status ?? "confirmée") as OrderStatus,
        total: Number(row.total ?? 0),
      })
    }
  }

  return NextResponse.json(matches, { headers: { "x-request-id": requestId } })
}

