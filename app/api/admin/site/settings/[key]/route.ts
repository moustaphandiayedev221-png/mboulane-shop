import { NextResponse } from "next/server"
import { z } from "zod"
import { createServiceRoleClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/admin/auth"

const putSchema = z.object({
  value: z.unknown(),
})

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })

  const { key } = await params
  const admin = createServiceRoleClient()
  const { data, error } = await admin
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ value: data?.value ?? null })
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })

  const { key } = await params
  const body = await req.json().catch(() => null)
  const parsed = putSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const admin = createServiceRoleClient()
  const { error } = await admin.from("site_settings").upsert({ key, value: parsed.data.value }, { onConflict: "key" })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

