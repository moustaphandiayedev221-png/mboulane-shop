import { NextResponse } from "next/server"
import { z } from "zod"
import { createServiceRoleClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/admin/auth"

const patchSchema = z.object({
  id: z.number().int().positive(),
  approved: z.boolean().optional(),
})

export async function GET(req: Request) {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })

  const url = new URL(req.url)
  const only = url.searchParams.get("only")?.trim()
  const approved =
    only === "approved" ? true : only === "pending" ? false : null

  const admin = createServiceRoleClient()
  let q = admin
    .from("product_reviews")
    .select("id, created_at, product_id, name, email, rating, title, comment, approved, source")
    .order("created_at", { ascending: false })
    .limit(500)

  if (approved !== null) q = q.eq("approved", approved)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reviews: data ?? [] })
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

  const update: Record<string, unknown> = {}
  if (typeof parsed.data.approved === "boolean") update.approved = parsed.data.approved
  if (Object.keys(update).length === 0) return NextResponse.json({ ok: true })

  const admin = createServiceRoleClient()
  const { error } = await admin.from("product_reviews").update(update).eq("id", parsed.data.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

