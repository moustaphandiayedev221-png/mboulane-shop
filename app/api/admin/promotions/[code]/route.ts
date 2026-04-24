import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/admin/auth"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })

  const { code } = await params
  const admin = createServiceRoleClient()
  const { error } = await admin.from("promo_codes").delete().eq("code", code.toUpperCase())
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

