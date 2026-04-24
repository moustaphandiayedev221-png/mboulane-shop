import { NextResponse } from "next/server"
import { z } from "zod"
import { createServiceRoleClient } from "@/lib/supabase/admin"
import { checkRateLimitAsync, getClientIp } from "@/lib/rate-limit"
import { getRequestId } from "@/lib/request-id"

const schema = z.object({
  orderId: z.string().min(6),
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

export async function POST(req: Request) {
  const requestId = getRequestId(req)
  const ip = getClientIp(req)
  const rl = await checkRateLimitAsync({ key: `orders_track:${ip}`, limit: 18, windowMs: 60_000 })
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

  const orderId = parsed.data.orderId.trim()
  const phoneDigits = normalizePhoneDigits(parsed.data.phone)
  if (phoneDigits.length < 6) {
    return NextResponse.json({ error: "Téléphone invalide." }, { status: 400, headers: { "x-request-id": requestId } })
  }
  const firstName = normalizeName(parsed.data.firstName)
  const lastName = normalizeName(parsed.data.lastName)
  if (!firstName || !lastName) {
    return NextResponse.json({ error: "Nom invalide." }, { status: 400, headers: { "x-request-id": requestId } })
  }

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, created_at, phone, first_name, last_name, status, total, delivery_fee, city, address, order_items (product_id, name, image, quantity, size, color, unit_price)",
    )
    .eq("id", orderId)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: "Service indisponible." }, { status: 503, headers: { "x-request-id": requestId } })
  }

  if (!data) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404, headers: { "x-request-id": requestId } })
  }

  const storedDigits = normalizePhoneDigits(String((data as { phone?: string | null }).phone ?? ""))
  if (!storedDigits || storedDigits !== phoneDigits) {
    return NextResponse.json(
      { error: "Commande introuvable." },
      { status: 404, headers: { "x-request-id": requestId } },
    )
  }

  const storedFirst = normalizeName(String((data as { first_name?: string | null }).first_name ?? ""))
  const storedLast = normalizeName(String((data as { last_name?: string | null }).last_name ?? ""))
  if (!storedFirst || !storedLast || storedFirst !== firstName || storedLast !== lastName) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404, headers: { "x-request-id": requestId } })
  }

  const status = String((data as { status?: string }).status ?? "") as OrderStatus
  const orderItemsRaw = (data as { order_items?: unknown }).order_items
  const orderItems = Array.isArray(orderItemsRaw) ? orderItemsRaw : []
  return NextResponse.json(
    {
      id: data.id,
      created_at: data.created_at,
      status,
      total: data.total,
      delivery_fee: data.delivery_fee,
      city: data.city,
      address: data.address,
      order_items: orderItems,
    },
    { headers: { "x-request-id": requestId } },
  )
}

