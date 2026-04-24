import { randomUUID } from "crypto"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { z } from "zod"
import { mapRowToProduct, type ProductRow } from "@/lib/catalog/map-db-row"
import type { CartItem } from "@/lib/cart/types"
import { checkRateLimitAsync, getClientIp } from "@/lib/rate-limit"
import { createServiceRoleClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const COOKIE = "mb_guest_cart"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 60

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function guestCookieOpts() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  }
}

const lineSchema = z.object({
  product_id: z.string().min(1),
  size: z.coerce.number().int(),
  color: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
})

type JoinRow = {
  quantity: number
  size: number
  color: string
  product: ProductRow | null
}

function rowsToCart(rows: JoinRow[]): CartItem[] {
  return rows
    .filter((r) => r.product?.id)
    .map((r) => ({
      product: mapRowToProduct(r.product as ProductRow),
      quantity: Number(r.quantity),
      size: Number(r.size),
      color: String(r.color ?? ""),
    }))
}

async function readToken(): Promise<string | null> {
  const jar = await cookies()
  const cur = jar.get(COOKIE)?.value?.trim() ?? ""
  if (cur && uuidRegex.test(cur)) return cur
  return null
}

export async function GET(req: Request) {
  const ip = getClientIp(req)
  const rl = await checkRateLimitAsync({ key: `guestcart:get:${ip}`, limit: 120, windowMs: 60_000 })
  if (!rl.allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 })
  }

  try {
    const admin = createServiceRoleClient()
    let token = await readToken()
    if (!token) token = randomUUID()

    const { data, error } = await admin
      .from("guest_cart_items")
      .select("quantity, size, color, product:products(*)")
      .eq("guest_token", token)
      .order("updated_at", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const items = rowsToCart((data ?? []) as unknown as JoinRow[])
    const res = NextResponse.json({ items })
    res.cookies.set(COOKIE, token, guestCookieOpts())
    return res
  } catch (e) {
    const msg = e instanceof Error ? e.message : "config"
    if (msg.includes("SUPABASE_SERVICE_ROLE_KEY") || msg.includes("manquantes")) {
      return NextResponse.json({ error: "Panier invité indisponible", items: [] }, { status: 503 })
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

const syncBodySchema = z.object({
  lines: z.array(lineSchema),
})

export async function POST(req: Request) {
  const ip = getClientIp(req)
  const rl = await checkRateLimitAsync({ key: `guestcart:post:${ip}`, limit: 60, windowMs: 60_000 })
  if (!rl.allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 })
  }

  let token = await readToken()
  if (!token) token = randomUUID()

  const raw = await req.json().catch(() => null)
  const parsed = syncBodySchema.safeParse(raw)
  if (!parsed.success) return NextResponse.json({ error: "Body invalide" }, { status: 400 })

  const lines = parsed.data.lines
  if (lines.length > 80) return NextResponse.json({ error: "Trop de lignes" }, { status: 400 })

  try {
    const admin = createServiceRoleClient()

    if (lines.length === 0) {
      const { error: delOnly } = await admin.from("guest_cart_items").delete().eq("guest_token", token)
      if (delOnly) return NextResponse.json({ error: delOnly.message }, { status: 500 })
      const emptyRes = NextResponse.json({ ok: true })
      emptyRes.cookies.set(COOKIE, token, guestCookieOpts())
      return emptyRes
    }

    const ids = [...new Set(lines.map((l) => l.product_id))]
    const { data: products, error: pe } = await admin.from("products").select("id").in("id", ids)
    if (pe) return NextResponse.json({ error: pe.message }, { status: 500 })
    const allowed = new Set((products ?? []).map((p) => p.id as string))
    const filtered = lines.filter((l) => allowed.has(l.product_id))
    if (filtered.length === 0) {
      return NextResponse.json({ error: "Produits invalides" }, { status: 400 })
    }

    const { error: delErr } = await admin.from("guest_cart_items").delete().eq("guest_token", token)
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })

    if (filtered.length > 0) {
      const rows = filtered.map((l) => ({
        guest_token: token,
        product_id: l.product_id,
        size: l.size,
        color: l.color,
        quantity: l.quantity,
      }))
      const { error: insErr } = await admin.from("guest_cart_items").insert(rows)
      if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.set(COOKIE, token, guestCookieOpts())
    return res
  } catch {
    return NextResponse.json({ error: "Panier invité indisponible" }, { status: 503 })
  }
}

export async function PUT(req: Request) {
  const ip = getClientIp(req)
  const rl = await checkRateLimitAsync({ key: `guestcart:put:${ip}`, limit: 120, windowMs: 60_000 })
  if (!rl.allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 })
  }

  let token = await readToken()
  if (!token) token = randomUUID()

  const raw = await req.json().catch(() => null)
  const parsed = lineSchema.safeParse(raw)
  if (!parsed.success) return NextResponse.json({ error: "Body invalide" }, { status: 400 })

  const l = parsed.data
  try {
    const admin = createServiceRoleClient()
    const { data: pr, error: pe } = await admin.from("products").select("id").eq("id", l.product_id).maybeSingle()
    if (pe || !pr) return NextResponse.json({ error: "Produit introuvable" }, { status: 400 })

    const { error } = await admin.from("guest_cart_items").upsert(
      {
        guest_token: token,
        product_id: l.product_id,
        size: l.size,
        color: l.color,
        quantity: l.quantity,
      },
      { onConflict: "guest_token,product_id,size,color" },
    )
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const res = NextResponse.json({ ok: true })
    res.cookies.set(COOKIE, token, guestCookieOpts())
    return res
  } catch {
    return NextResponse.json({ error: "Panier invité indisponible" }, { status: 503 })
  }
}

export async function DELETE(req: Request) {
  const ip = getClientIp(req)
  const rl = await checkRateLimitAsync({ key: `guestcart:del:${ip}`, limit: 60, windowMs: 60_000 })
  if (!rl.allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 })
  }

  const token = await readToken()
  const url = new URL(req.url)
  const all = url.searchParams.get("all") === "1"

  try {
    const admin = createServiceRoleClient()
    if (!token) {
      const res = NextResponse.json({ ok: true })
      res.cookies.delete(COOKIE)
      return res
    }

    if (all) {
      const { error } = await admin.from("guest_cart_items").delete().eq("guest_token", token)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      const res = NextResponse.json({ ok: true })
      res.cookies.delete(COOKIE)
      return res
    }

    const productId = url.searchParams.get("product_id")
    const sizeRaw = url.searchParams.get("size")
    const color = url.searchParams.get("color")
    if (!productId || sizeRaw == null || !color) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })
    }
    const size = Number(sizeRaw)
    if (!Number.isFinite(size)) return NextResponse.json({ error: "Taille invalide" }, { status: 400 })

    const { error } = await admin
      .from("guest_cart_items")
      .delete()
      .eq("guest_token", token)
      .eq("product_id", productId)
      .eq("size", size)
      .eq("color", color)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const res = NextResponse.json({ ok: true })
    res.cookies.set(COOKIE, token, guestCookieOpts())
    return res
  } catch {
    return NextResponse.json({ error: "Panier invité indisponible" }, { status: 503 })
  }
}
