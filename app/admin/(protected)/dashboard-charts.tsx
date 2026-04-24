"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type Point = {
  day: string
  revenue: number
  orders_count: number
}

function formatFcfa(v: number) {
  return `${Math.round(v).toLocaleString("fr-FR")} FCFA`
}

function shortDayLabel(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`)
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
}

export function DashboardCharts({ series }: { series: Point[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
            Évolution (30 jours)
          </p>
          <p className="mt-2 text-lg font-semibold text-white">CA & commandes</p>
        </div>
        <p className="text-xs text-white/55">
          Sur la base des commandes enregistrées dans Supabase.
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/20 p-4 lg:col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Chiffre d’affaires</p>
          <div className="mt-3 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
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
                  tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                  tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
                  tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(11,11,12,0.92)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 12,
                    color: "white",
                  }}
                  labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                  formatter={(value) => formatFcfa(Number(value))}
                  labelFormatter={(label) => new Date(`${label}T00:00:00`).toLocaleDateString("fr-FR")}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#b38b6d"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Commandes</p>
          <div className="mt-3 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
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
                  formatter={(value) => `${Number(value)} commande(s)`}
                  labelFormatter={(label) => new Date(`${label}T00:00:00`).toLocaleDateString("fr-FR")}
                />
                <Line
                  type="monotone"
                  dataKey="orders_count"
                  stroke="rgba(255,255,255,0.75)"
                  strokeWidth={2.25}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

