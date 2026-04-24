import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient as createAuthedServerClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/admin"
import { checkRateLimitAsync, getClientIp } from "@/lib/rate-limit"
import { logError, logInfo, logWarn } from "@/lib/log"
import { getRequestId } from "@/lib/request-id"

const orderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  image: z.string().min(1),
  quantity: z.number().int().positive(),
  size: z.number().int().nonnegative(),
  color: z.string().min(1),
  unitPrice: z.number().nonnegative(),
})

const createOrderSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(3),
  address: z.string().min(3),
  city: z.string().min(1),
  notes: z.string().optional().nullable(),
  paymentMethod: z.literal("cash_on_delivery"),
  subtotal: z.number().nonnegative(),
  deliveryFee: z.number().nonnegative(),
  promoCode: z.string().optional().nullable(),
  discount: z.number().nonnegative().optional().nullable(),
  total: z.number().nonnegative(),
  items: z.array(orderItemSchema).min(1),
})

function generateOrderId(): string {
  const t = Date.now()
  const r = Math.floor(Math.random() * 900 + 100)
  return `MB-${t}-${r}`
}

type RpcOrderResult = {
  ok?: boolean
  error?: string
  reason?: string
  id?: string
  expected?: number
  product_id?: string
}

export async function POST(req: Request) {
  const requestId = getRequestId(req)
  const ip = getClientIp(req)
  const rl = await checkRateLimitAsync({ key: `orders:${ip}`, limit: 8, windowMs: 60_000 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez plus tard." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec), "x-request-id": requestId } },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = createOrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400, headers: { "x-request-id": requestId } },
    )
  }

  const authed = await createAuthedServerClient()
  const { data: userData } = await authed.auth.getUser()

  const id = generateOrderId()
  const promoCode = parsed.data.promoCode?.trim().toUpperCase() || null

  const payload = {
    order_id: id,
    email: parsed.data.email.trim(),
    first_name: parsed.data.firstName.trim(),
    last_name: parsed.data.lastName.trim(),
    phone: parsed.data.phone.trim(),
    city: parsed.data.city,
    address: parsed.data.address.trim(),
    notes: parsed.data.notes?.trim() || null,
    payment_method: parsed.data.paymentMethod,
    user_id: userData.user?.id ?? null,
    promo_code: promoCode,
    client_total: Number(parsed.data.total),
    client_delivery_fee: Number(parsed.data.deliveryFee),
    items: parsed.data.items.map((it) => ({
      product_id: it.productId,
      quantity: it.quantity,
      size: it.size,
      color: it.color,
    })),
  }

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase.rpc("create_order_from_checkout", { payload })

  if (error) {
    const msg = error.message ?? ""
    logError("orders.rpc_failed", { id, ip, error: msg }, requestId)
    if (msg.includes("stock_insufficient") || msg.includes("stock")) {
      return NextResponse.json(
        { error: "Stock insuffisant" },
        { status: 409, headers: { "x-request-id": requestId } },
      )
    }
    if (msg.includes("promo_consume")) {
      return NextResponse.json(
        { error: "Code promo indisponible" },
        { status: 409, headers: { "x-request-id": requestId } },
      )
    }
    if (msg.includes("create_order_from_checkout") || msg.includes("does not exist")) {
      return NextResponse.json(
        {
          error: "Service commande indisponible. Appliquez la migration Supabase 016 (create_order_from_checkout).",
        },
        { status: 503, headers: { "x-request-id": requestId } },
      )
    }
    return NextResponse.json({ error: msg }, { status: 500, headers: { "x-request-id": requestId } })
  }

  const res = data as RpcOrderResult | null
  if (!res?.ok) {
    const code = res?.error ?? "unknown"
    logWarn("orders.rpc_rejected", { id, ip, code, reason: res?.reason, expected: res?.expected }, requestId)
    if (code === "total_mismatch") {
      return NextResponse.json(
        { error: "Montant invalide. Veuillez actualiser et réessayer.", expected: res?.expected },
        { status: 400, headers: { "x-request-id": requestId } },
      )
    }
    if (code === "promo_invalid") {
      return NextResponse.json(
        { error: "Code promo invalide", reason: res?.reason ?? "invalid" },
        { status: 400, headers: { "x-request-id": requestId } },
      )
    }
    if (code === "product_not_found") {
      return NextResponse.json(
        { error: "Produit introuvable dans le panier", productId: res?.product_id },
        { status: 400, headers: { "x-request-id": requestId } },
      )
    }
    if (code === "order_exists") {
      return NextResponse.json({ error: "Commande déjà enregistrée" }, { status: 409, headers: { "x-request-id": requestId } })
    }
    return NextResponse.json({ error: "Commande refusée", code }, { status: 400, headers: { "x-request-id": requestId } })
  }

  const email = parsed.data.email.trim().toLowerCase()
  logInfo("orders.created", { id: res.id ?? id, ip, email, promoCode: promoCode ?? null }, requestId)

  return NextResponse.json({ id: res.id ?? id }, { headers: { "x-request-id": requestId } })
}

export async function GET() {
  const supabase = await createAuthedServerClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, created_at, email, first_name, last_name, phone, city, address, notes, payment_method, subtotal, delivery_fee, total, status, order_items (product_id, name, image, quantity, size, color, unit_price)",
    )
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(orders ?? [])
}
