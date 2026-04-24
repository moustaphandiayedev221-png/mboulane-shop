import { NextResponse } from "next/server"
import { z } from "zod"
import { createServiceRoleClient } from "@/lib/supabase/admin"
import { isSubtitleSchemaError } from "@/lib/admin/categories-subtitle-compat"
import { assertAdmin } from "@/lib/admin/auth"

const schema = z.object({
  label: z.string().min(1),
  sort_order: z.number().int().optional().default(0),
  image: z.string().optional().nullable(),
  image_storage_path: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
})

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })

  const { id } = await params
  const admin = createServiceRoleClient()
  const { error } = await admin.from("categories").delete().eq("id", Number(id))
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })

  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const admin = createServiceRoleClient()
  const payloadFull = {
    label: parsed.data.label,
    sort_order: parsed.data.sort_order,
    image: parsed.data.image ?? null,
    image_storage_path: parsed.data.image_storage_path ?? null,
    subtitle: parsed.data.subtitle ?? null,
  }
  let { error } = await admin.from("categories").update(payloadFull).eq("id", Number(id))
  if (error && isSubtitleSchemaError(error.message)) {
    const { subtitle: _s, ...payloadSlim } = payloadFull
    ;({ error } = await admin.from("categories").update(payloadSlim).eq("id", Number(id)))
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

