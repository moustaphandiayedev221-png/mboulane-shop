"use client"

import { useEffect, useMemo, useState } from "react"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

type Row = { day: string; visits: number; uniques: number }

function shortDayLabel(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`)
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
}

export function VisitorsChart() {
  const [rows, setRows] = useState<Row[]>([])

  useEffect(() => {
    void fetch("/api/admin/analytics/visits?days=30", { cache: "no-store" })
      .then((r) => r.json() as Promise<{ rows?: Row[] }>)
      .then((d) => setRows(Array.isArray(d.rows) ? d.rows : []))
      .catch(() => setRows([]))
  }, [])

  const today = rows[rows.length - 1]
  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({ visits: acc.visits + Number(r.visits ?? 0), uniques: acc.uniques + Number(r.uniques ?? 0) }),
      { visits: 0, uniques: 0 },
    )
  }, [rows])

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">Visiteurs (30 jours)</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {today ? `${today.uniques} uniques aujourd’hui` : "—"}
          </p>
          <p className="mt-1 text-xs text-white/55">
            Total 30j: {totals.uniques} uniques · {totals.visits} visites
          </p>
        </div>
        <p className="text-xs text-white/55">Uniques ≈ 1 par session/IP/jour</p>
      </div>

      <div className="mt-4 h-[260px] rounded-xl border border-white/10 bg-black/20 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis
              dataKey="day"
              tickFormatter={shortDayLabel}
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
              axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
              tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
              minTickGap={18}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
              axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
              tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(11,11,12,0.92)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
                color: "white",
              }}
              labelStyle={{ color: "rgba(255,255,255,0.7)" }}
              formatter={(value, name) => {
                const label = name === "uniques" ? "Uniques" : "Visites"
                return [`${Number(value)}`, label]
              }}
              labelFormatter={(label) => new Date(`${label}T00:00:00`).toLocaleDateString("fr-FR")}
            />
            <Line type="monotone" dataKey="uniques" stroke="#b38b6d" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="visits" stroke="rgba(255,255,255,0.75)" strokeWidth={2.25} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

