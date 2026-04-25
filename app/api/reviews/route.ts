import { NextResponse } from "next/server"
import { z } from "zod"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { checkRateLimitAsync, getClientIp } from "@/lib/rate-limit"
import { getRequestId } from "@/lib/request-id"
import crypto from "crypto"

const createSchema = z.object({
  productId: z.string().min(1),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().optional().nullable(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().nullable(),
  comment: z.string().trim().min(10).max(2000),
  // honeypot anti-spam (doit rester vide)
  website: z.string().optional().nullable(),
})

function ipHash(ip: string): string | null {
  if (!ip || ip === "unknown") return null
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 32)
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const productId = url.searchParams.get("product_id")?.trim()
  if (!productId) return NextResponse.json({ error: "product_id requis" }, { status: 400 })

  const supabase = createPublicServerClient()
  const { data, error } = await supabase
    .from("product_reviews")
    .select("id, created_at, product_id, name, rating, title, comment")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: "Service indisponible." }, { status: 503 })
  return NextResponse.json({ reviews: data ?? [] })
}

export async function POST(req: Request) {
  const requestId = getRequestId(req)
  const ip = getClientIp(req)

  const rl = await checkRateLimitAsync({
    key: `reviews:${ip}`,
    limit: 8,
    windowMs: 60_000,
  })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez plus tard." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec), "x-request-id": requestId } },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400, headers: { "x-request-id": requestId } },
    )
  }

  if (parsed.data.website && parsed.data.website.trim() !== "") {
    // honeypot rempli => bot
    return NextResponse.json({ ok: true }, { headers: { "x-request-id": requestId } })
  }

  const supabase = createPublicServerClient()
  const row = {
    product_id: parsed.data.productId,
    name: parsed.data.name,
    email: parsed.data.email?.trim() || null,
    rating: parsed.data.rating,
    title: parsed.data.title?.trim() || null,
    comment: parsed.data.comment,
    approved: false,
    source: "site",
    ip_hash: ipHash(ip),
  }

  const { error } = await supabase.from("product_reviews").insert(row)
  if (error) {
    return NextResponse.json(
      { error: "Impossible d'envoyer l'avis pour le moment." },
      { status: 503, headers: { "x-request-id": requestId } },
    )
  }

  return NextResponse.json(
    { ok: true, message: "Merci ! Votre avis a été envoyé et sera publié après validation." },
    { headers: { "x-request-id": requestId } },
  )
}

