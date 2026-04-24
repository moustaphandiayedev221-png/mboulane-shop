import { NextResponse } from "next/server"
import { z } from "zod"
import { createServiceRoleClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/admin/auth"

const pageSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(10).max(200).default(50),
})

const patchSchema = z.object({
  email: z.string().email(),
  subscribed: z.boolean(),
})

export async function GET(req: Request) {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })

  const url = new URL(req.url)
  const parsed = pageSchema.safeParse({
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
  })
  if (!parsed.success) {
    return NextResponse.json({ error: "Paramètres invalides", details: parsed.error.flatten() }, { status: 400 })
  }
  const { page, pageSize } = parsed.data
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const admin = createServiceRoleClient()
  const { data, error, count } = await admin
    .from("newsletter_subscribers")
    .select("id, created_at, email, source, subscribed", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({
    subscribers: data ?? [],
    page,
    pageSize,
    total: count ?? 0,
  })
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
  const email = parsed.data.email.trim().toLowerCase()
  const { error } = await admin
    .from("newsletter_subscribers")
    .update({ subscribed: parsed.data.subscribed })
    .eq("email", email)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

