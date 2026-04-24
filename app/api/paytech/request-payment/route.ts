import { NextResponse } from "next/server"
import { z } from "zod"
import { checkRateLimitAsync, getClientIp } from "@/lib/rate-limit"
import { getRequestId } from "@/lib/request-id"
import { logError } from "@/lib/log"

const orderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  image: z.string().min(1),
  quantity: z.number().int().positive(),
  size: z.number().int().nonnegative(),
  color: z.string().min(1),
  unitPrice: z.number().nonnegative(),
})

const requestSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(3),
  address: z.string().min(3),
  city: z.string().min(1),
  notes: z.string().optional().nullable(),
  paymentMethod: z.literal("paytech"),
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
  // PayTech utilise souvent une ref du style "CMD_..."
  return `CMD_${t}_${r}`
}

function getOrigin(req: Request): string {
  const url = new URL(req.url)
  return url.origin
}

export async function POST(req: Request) {
  const requestId = getRequestId(req)
  const ip = getClientIp(req)
  const rl = await checkRateLimitAsync({ key: `paytech:req:${ip}`, limit: 10, windowMs: 60_000 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez plus tard." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec), "x-request-id": requestId } },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400, headers: { "x-request-id": requestId } },
    )
  }

  const apiKey = process.env.PAYTECH_API_KEY?.trim()
  const apiSecret = process.env.PAYTECH_API_SECRET?.trim()
  const env = (process.env.PAYTECH_ENV?.trim() || "prod") as "test" | "prod"

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "PayTech non configuré (PAYTECH_API_KEY / PAYTECH_API_SECRET)." },
      { status: 503, headers: { "x-request-id": requestId } },
    )
  }

  const orderId = generateOrderId()
  const origin = getOrigin(req)

  const ipnUrl = process.env.PAYTECH_IPN_URL?.trim() || `${origin}/api/paytech/ipn`
  const successUrl = `${origin}/paytech/success?ref=${encodeURIComponent(orderId)}`
  const cancelUrl = `${origin}/paytech/cancel?ref=${encodeURIComponent(orderId)}`

  if (!ipnUrl.startsWith("https://")) {
    return NextResponse.json(
      {
        error:
          "PayTech indisponible en local: `PAYTECH_IPN_URL` doit être une URL publique HTTPS (PayTech exige HTTPS pour l'IPN).",
        hint: "Utilise un tunnel (ngrok) ou déploie (Vercel), puis mets PAYTECH_IPN_URL=https://.../api/paytech/ipn",
      },
      { status: 503, headers: { "x-request-id": requestId } },
    )
  }

  // PayTech attend un `custom_field` JSON encodé en string.
  // Dans les IPN, PayTech renvoie souvent ce champ encodé en Base64.
  const customField = JSON.stringify({
    orderId,
    orderPayload: {
      email: parsed.data.email,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone,
      address: parsed.data.address,
      city: parsed.data.city,
      notes: parsed.data.notes ?? null,
      paymentMethod: "paytech" as const,
      subtotal: parsed.data.subtotal,
      deliveryFee: parsed.data.deliveryFee,
      promoCode: parsed.data.promoCode ?? null,
      discount: parsed.data.discount ?? 0,
      total: parsed.data.total,
      items: parsed.data.items,
    },
  })

  const paymentRequestUrl = "https://paytech.sn/api/payment/request-payment"

  const paymentDataBase = {
    item_name: `Commande ${orderId} — MBOULANE`,
    item_price: Math.round(parsed.data.total),
    currency: "XOF",
    ref_command: orderId,
    command_name: `Commande ${orderId} — MBOULANE`,
    env,
    custom_field: customField,
  }

  const paymentData = {
    ...paymentDataBase,
    ipn_url: ipnUrl,
    ...(successUrl.startsWith("https://") ? { success_url: successUrl } : {}),
    ...(cancelUrl.startsWith("https://") ? { cancel_url: cancelUrl } : {}),
  }

  try {
    const parseJson = async (res: Response) =>
      (await res.json().catch(() => null)) as
        | { success?: 0 | 1; redirect_url?: string; redirectUrl?: string; message?: string; errors?: unknown; token?: string }
        | null

    // Essai 1: JSON (doc officielle)
    let res = await fetch(paymentRequestUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        API_KEY: apiKey,
        API_SECRET: apiSecret,
      },
      body: JSON.stringify(paymentData),
    })

    let data = await parseJson(res)

    // Essai 2: x-www-form-urlencoded (exemple PHP doc)
    if (
      (!res.ok || !data || data.success !== 1) &&
      (data?.message ?? "").toLowerCase().includes("format de requete invalid")
    ) {
      const form = new URLSearchParams()
      for (const [k, v] of Object.entries(paymentData)) {
        form.set(k, String(v))
      }
      res = await fetch(paymentRequestUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          API_KEY: apiKey,
          API_SECRET: apiSecret,
        },
        body: form.toString(),
      })
      data = await parseJson(res)
    }

    if (!res.ok || !data || data.success !== 1) {
      logError(
        "paytech.request_payment_failed",
        { orderId, status: res.status, message: data?.message ?? null },
        requestId,
      )
      return NextResponse.json(
        { error: "PayTech indisponible. Réessayez.", details: data?.message ?? null },
        { status: 502, headers: { "x-request-id": requestId } },
      )
    }

    const redirectUrl = data.redirect_url || data.redirectUrl
    if (!redirectUrl) {
      return NextResponse.json(
        { error: "Réponse PayTech invalide (redirect_url manquant)." },
        { status: 502, headers: { "x-request-id": requestId } },
      )
    }

    return NextResponse.json({ redirectUrl }, { headers: { "x-request-id": requestId } })
  } catch (e) {
    logError("paytech.request_payment_exception", { orderId, ip, error: String(e) }, requestId)
    return NextResponse.json(
      { error: "Erreur réseau PayTech. Réessayez." },
      { status: 502, headers: { "x-request-id": requestId } },
    )
  }
}

