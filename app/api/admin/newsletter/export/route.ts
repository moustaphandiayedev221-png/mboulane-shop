import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/admin/auth"

type Row = {
  created_at: string
  email: string
  source: string
  subscribed: boolean
}

function csvEscape(value: unknown): string {
  const s = String(value ?? "")
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export async function GET() {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })

  const admin = createServiceRoleClient()
  const pageSize = 1000
  const maxRows = 50_000
  let offset = 0
  const rows: Row[] = []

  while (rows.length < maxRows) {
    const { data, error } = await admin
      .from("newsletter_subscribers")
      .select("created_at,email,source,subscribed")
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const chunk = (data ?? []) as Row[]
    if (chunk.length === 0) break
    rows.push(...chunk)
    if (chunk.length < pageSize) break
    offset += pageSize
  }

  const header = ["email", "source", "subscribed", "created_at"].join(",")
  const lines = rows.map((r) =>
    [
      csvEscape(r.email),
      csvEscape(r.source),
      csvEscape(r.subscribed ? "1" : "0"),
      csvEscape(r.created_at),
    ].join(","),
  )
  const csv = [header, ...lines].join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="newsletter-subscribers.csv"`,
      "Cache-Control": "no-store",
    },
  })
}

