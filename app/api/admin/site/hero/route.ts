import { NextResponse } from "next/server"
import { z } from "zod"
import { createServiceRoleClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/admin/auth"

const heroSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  ctaLabel: z.string().min(1),
  ctaHref: z.string().min(1),
  backgroundImage: z.string().optional().nullable(),
  backgroundImageStoragePath: z.string().optional().nullable(),
})

export async function GET() {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })

  const admin = createServiceRoleClient()
  const { data, error } = await admin
    .from("site_settings")
    .select("value")
    .eq("key", "hero")
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ value: data?.value ?? null })
}

export async function PUT(req: Request) {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })

  const body = await req.json().catch(() => null)
  const parsed = heroSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const admin = createServiceRoleClient()
  const { error } = await admin.from("site_settings").upsert(
    {
      key: "hero",
      value: parsed.data,
    },
    { onConflict: "key" },
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

