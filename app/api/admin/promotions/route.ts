import { NextResponse } from "next/server"
import { z } from "zod"
import { createServiceRoleClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/admin/auth"

const schema = z.object({
  code: z.string().min(2).transform((s) => s.trim().toUpperCase()),
  active: z.boolean().default(true),
  description: z.string().optional().nullable(),
  type: z.enum(["percent", "fixed"]),
  value: z.number().nonnegative(),
  min_subtotal: z.number().nonnegative().default(0),
  starts_at: z.string().datetime().optional().nullable(),
  ends_at: z.string().datetime().optional().nullable(),
  usage_limit: z.number().int().positive().optional().nullable(),
})

export async function GET() {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })

  const admin = createServiceRoleClient()
  const { data, error } = await admin
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ promos: data ?? [] })
}

export async function POST(req: Request) {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const admin = createServiceRoleClient()
  const row = {
    ...parsed.data,
    starts_at: parsed.data.starts_at ?? null,
    ends_at: parsed.data.ends_at ?? null,
    usage_limit: parsed.data.usage_limit ?? null,
  }

  const { error } = await admin.from("promo_codes").upsert(row, { onConflict: "code" })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

