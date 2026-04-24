import { NextResponse } from "next/server"
import crypto from "crypto"
import { z } from "zod"
import { createServiceRoleClient } from "@/lib/supabase/admin"
import { getRequestId } from "@/lib/request-id"
import { logError, logInfo, logWarn } from "@/lib/log"

const ipnSchema = z.object({
  type_event: z.string().min(1),
  ref_command: z.string().min(1),
  item_price: z.union([z.number(), z.string()]).optional(),
  final_item_price: z.union([z.number(), z.string()]).optional(),
  api_key_sha256: z.string().optional(),
  api_secret_sha256: z.string().optional(),
  hmac_compute: z.string().optional(),
  custom_field: z.string().optional(),
  token: z.string().optional(),
  payment_method: z.string().optional(),
})

function fromBase64(input: string): string {
  return Buffer.from(input, "base64").toString("utf8")
}

function tryParseCustomField(input: string): unknown {
  // PayTech peut renvoyer custom_field encodé en Base64, mais côté requête
  // on l’envoie en JSON string. On supporte les deux.
  try {
    return JSON.parse(fromBase64(input))
  } catch {
    return JSON.parse(input)
  }
}

function parseNumber(v: unknown): number {
  if (typeof v === "number") return v
  if (typeof v === "string" && v.trim()) {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function timingSafeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "hex")
    const bb = Buffer.from(b, "hex")
    if (ba.length !== bb.length) return false
    return crypto.timingSafeEqual(ba, bb)
  } catch {
    return false
  }
}

function verifyHmac(params: { apiKey: string; apiSecret: string; amount: number; ref: string; received: string }): boolean {
  const message = `${params.amount}|${params.ref}|${params.apiKey}`
  const expected = crypto.createHmac("sha256", params.apiSecret).update(message).digest("hex")
  return timingSafeEqualHex(expected, params.received)
}

export async function POST(req: Request) {
  const requestId = getRequestId(req)
  const body = await req.json().catch(() => null)
  const parsed = ipnSchema.safeParse(body)
  if (!parsed.success) {
    return new NextResponse("IPN KO", { status: 400, headers: { "x-request-id": requestId } })
  }

  const apiKey = process.env.PAYTECH_API_KEY?.trim()
  const apiSecret = process.env.PAYTECH_API_SECRET?.trim()
  if (!apiKey || !apiSecret) {
    return new NextResponse("IPN KO", { status: 503, headers: { "x-request-id": requestId } })
  }

  const { type_event, ref_command, hmac_compute } = parsed.data
  const amount = parseNumber(parsed.data.final_item_price ?? parsed.data.item_price)

  if (hmac_compute) {
    const ok = verifyHmac({ apiKey, apiSecret, amount, ref: ref_command, received: hmac_compute })
    if (!ok) {
      logWarn("paytech.ipn_invalid_hmac", { ref_command, type_event }, requestId)
      return new NextResponse("IPN KO - NOT FROM PAYTECH", { status: 403, headers: { "x-request-id": requestId } })
    }
  } else {
    // Si PayTech n’envoie pas hmac_compute, on refuse (la doc propose SHA256 en alternative,
    // mais on garde une règle stricte côté serveur).
    logWarn("paytech.ipn_missing_hmac", { ref_command, type_event }, requestId)
    return new NextResponse("IPN KO - MISSING HMAC", { status: 403, headers: { "x-request-id": requestId } })
  }

  // Paiement annulé → on ignore côté DB.
  if (type_event === "sale_canceled") {
    logInfo("paytech.ipn_canceled", { ref_command }, requestId)
    return new NextResponse("IPN OK", { status: 200, headers: { "x-request-id": requestId } })
  }

  if (type_event !== "sale_complete") {
    logInfo("paytech.ipn_ignored", { ref_command, type_event }, requestId)
    return new NextResponse("IPN OK", { status: 200, headers: { "x-request-id": requestId } })
  }

  const custom = parsed.data.custom_field?.trim()
  if (!custom) {
    logError("paytech.ipn_missing_custom_field", { ref_command }, requestId)
    return new NextResponse("IPN KO", { status: 400, headers: { "x-request-id": requestId } })
  }

  let decoded: unknown = null
  try {
    decoded = tryParseCustomField(custom)
  } catch (e) {
    logError("paytech.ipn_custom_field_decode_failed", { ref_command, error: String(e) }, requestId)
    return new NextResponse("IPN KO", { status: 400, headers: { "x-request-id": requestId } })
  }

  const decodedSchema = z.object({
    orderId: z.string().min(1),
    orderPayload: z.any(),
  })
  const decodedParsed = decodedSchema.safeParse(decoded)
  if (!decodedParsed.success) {
    return new NextResponse("IPN KO", { status: 400, headers: { "x-request-id": requestId } })
  }

  // Crée la commande au moment du paiement réussi.
  try {
    const supabase = createServiceRoleClient()
    const orderPayload = decodedParsed.data.orderPayload as Record<string, unknown>

    const promoCode =
      typeof orderPayload.promoCode === "string" ? (orderPayload.promoCode.trim().toUpperCase() || null) : null

    const rpcPayload = {
      order_id: ref_command,
      email: String(orderPayload.email ?? "").trim(),
      first_name: String(orderPayload.firstName ?? "").trim(),
      last_name: String(orderPayload.lastName ?? "").trim(),
      phone: String(orderPayload.phone ?? "").trim(),
      city: String(orderPayload.city ?? "").trim(),
      address: String(orderPayload.address ?? "").trim(),
      notes: (typeof orderPayload.notes === "string" ? orderPayload.notes.trim() : null) || null,
      payment_method: "paytech",
      promo_code: promoCode,
      client_total: Number(orderPayload.total ?? 0),
      client_delivery_fee: Number(orderPayload.deliveryFee ?? 0),
      items: Array.isArray(orderPayload.items)
        ? (orderPayload.items as Array<Record<string, unknown>>).map((it) => ({
            product_id: String(it.productId ?? ""),
            quantity: Number(it.quantity ?? 0),
            size: Number(it.size ?? 0),
            color: String(it.color ?? ""),
          }))
        : [],
    }

    const { data, error } = await supabase.rpc("create_order_from_checkout", { payload: rpcPayload })
    if (error) {
      logError("paytech.ipn_create_order_rpc_failed", { ref_command, error: error.message }, requestId)
      return new NextResponse("IPN KO", { status: 500, headers: { "x-request-id": requestId } })
    }

    const res = data as { ok?: boolean; error?: string } | null
    if (!res?.ok) {
      // order_exists → ok (idempotent)
      if (res?.error === "order_exists") {
        logInfo("paytech.ipn_order_exists", { ref_command }, requestId)
        return new NextResponse("IPN OK", { status: 200, headers: { "x-request-id": requestId } })
      }
      logError("paytech.ipn_create_order_rejected", { ref_command, code: res?.error ?? "unknown" }, requestId)
      return new NextResponse("IPN KO", { status: 400, headers: { "x-request-id": requestId } })
    }

    logInfo("paytech.ipn_order_created", { ref_command, token: parsed.data.token ?? null }, requestId)
    return new NextResponse("IPN OK", { status: 200, headers: { "x-request-id": requestId } })
  } catch (e) {
    logError("paytech.ipn_exception", { ref_command, error: String(e) }, requestId)
    return new NextResponse("IPN KO", { status: 500, headers: { "x-request-id": requestId } })
  }
}

