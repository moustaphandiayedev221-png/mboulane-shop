import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/admin/auth"

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })

  const { id } = await ctx.params
  const n = Number(id)
  if (!Number.isFinite(n) || n <= 0) return NextResponse.json({ error: "ID invalide" }, { status: 400 })

  const admin = createServiceRoleClient()
  const { error } = await admin.from("product_reviews").delete().eq("id", n)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

