import { NextResponse } from "next/server"
import { z } from "zod"
import { createServiceRoleClient } from "@/lib/supabase/admin"
import { adminSelectCategories, isSubtitleSchemaError, omitSubtitle } from "@/lib/admin/categories-subtitle-compat"
import { assertAdmin } from "@/lib/admin/auth"

const schema = z.object({
  label: z.string().min(1),
  sort_order: z.number().int().optional().default(0),
  image: z.string().optional().nullable(),
  image_storage_path: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
})

export async function GET() {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })

  const admin = createServiceRoleClient()
  const { data, error } = await adminSelectCategories(admin)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ categories: data ?? [] })
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
  let { error } = await admin.from("categories").upsert(parsed.data, { onConflict: "label" })
  if (error && isSubtitleSchemaError(error.message)) {
    ;({ error } = await admin
      .from("categories")
      .upsert(omitSubtitle(parsed.data as Record<string, unknown>), { onConflict: "label" }))
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

