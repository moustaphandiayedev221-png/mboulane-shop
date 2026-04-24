import { NextResponse } from "next/server"
import { z } from "zod"
import { createServiceRoleClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/admin/auth"

const upsertSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  location: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1),
  review_date: z.string().min(1),
  verified: z.boolean().default(false),
  sort_order: z.number().int().default(0),
})

const patchSchema = z.object({
  id: z.string().min(1),
  verified: z.boolean().optional(),
  sort_order: z.number().int().optional(),
})

export async function GET() {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })

  const admin = createServiceRoleClient()
  const { data, error } = await admin
    .from("customer_reviews")
    .select("*")
    .order("sort_order", { ascending: true })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reviews: data ?? [] })
}

export async function POST(req: Request) {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })

  const body = await req.json().catch(() => null)
  const parsed = upsertSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const admin = createServiceRoleClient()
  const { error } = await admin.from("customer_reviews").upsert(parsed.data, { onConflict: "id" })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request) {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })

  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const admin = createServiceRoleClient()
  const { id, ...rest } = parsed.data
  const update: Record<string, unknown> = {}
  if (typeof rest.verified === "boolean") update.verified = rest.verified
  if (typeof rest.sort_order === "number") update.sort_order = rest.sort_order

  const { error } = await admin.from("customer_reviews").update(update).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

