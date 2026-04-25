import { NextResponse } from "next/server"
import { assertAdmin } from "@/lib/admin/auth"
import { createServiceRoleClient } from "@/lib/supabase/admin"

export async function GET(req: Request) {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })

  const url = new URL(req.url)
  const days = Math.min(90, Math.max(7, Number(url.searchParams.get("days") ?? "30")))

  const admin = createServiceRoleClient()
  const from = new Date()
  from.setDate(from.getDate() - (days - 1))
  const fromIso = from.toISOString().slice(0, 10) // YYYY-MM-DD

  const { data, error } = await admin
    .from("daily_visits")
    .select("day, visits, uniques")
    .gte("day", fromIso)
    .order("day", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ rows: data ?? [] })
}

