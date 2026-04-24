import { createServiceRoleClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/admin/auth"
import { TrendingUp, ShoppingCart, Users, BadgePercent } from "lucide-react"
import { DashboardCharts } from "../dashboard-charts"

type OrderRow = {
  id: string
  created_at: string
  total: number
  status: string
  promo_code: string | null
  discount: number
}

function formatFcfa(v: number) {
  return `${Math.round(v).toLocaleString("fr-FR")} FCFA`
}

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfMonth() {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

async function getDashboardStats() {
  const check = await assertAdmin()
  if (!check.ok) return null
  const admin = createServiceRoleClient()

  const [products, categories, ordersCount, customersCount, recentOrders] = await Promise.all([
    admin.from("products").select("id", { count: "exact", head: true }),
    admin.from("categories").select("id", { count: "exact", head: true }),
    admin.from("orders").select("id", { count: "exact", head: true }),
    admin.from("customers").select("id", { count: "exact", head: true }),
    admin
      .from("orders")
      .select("id, created_at, total, status, promo_code, discount")
      .order("created_at", { ascending: false })
      .limit(200),
  ])

  const orders: OrderRow[] = ((recentOrders.data ?? []) as unknown as OrderRow[]).map((o) => ({
    ...o,
    total: Number(o.total ?? 0),
    discount: Number(o.discount ?? 0),
  }))

  const monthStart = startOfMonth()
  const todayStart = startOfToday()

  const monthOrders = orders.filter((o) => new Date(o.created_at) >= monthStart)
  const todayOrders = orders.filter((o) => new Date(o.created_at) >= todayStart)

  const monthRevenue = monthOrders.reduce((acc, o) => acc + Number(o.total || 0), 0)
  const todayRevenue = todayOrders.reduce((acc, o) => acc + Number(o.total || 0), 0)
  const monthAov = monthOrders.length ? monthRevenue / monthOrders.length : 0
  const monthPromoUses = monthOrders.filter((o) => Boolean(o.promo_code)).length

  const statusCounts = monthOrders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1
    return acc
  }, {})

  const [allTime, series] = await Promise.all([
    admin.rpc("orders_kpis", {
      from_ts: "1970-01-01T00:00:00.000Z",
      to_ts: new Date().toISOString(),
    }),
    admin.rpc("orders_timeseries_daily", { days_back: 30 }),
  ])

  const allTimeRow = Array.isArray(allTime.data) ? allTime.data[0] : null
  const allTimeRevenue = Number((allTimeRow as { revenue?: number } | null)?.revenue ?? 0)

  const seriesRows = Array.isArray(series.data)
    ? (series.data as unknown as Array<{ day: string; revenue: number; orders_count: number }>)
    : []

  return {
    counts: {
      products: products.count ?? 0,
      categories: categories.count ?? 0,
      orders: ordersCount.count ?? 0,
      customers: customersCount.count ?? 0,
    },
    month: {
      orders: monthOrders.length,
      revenue: monthRevenue,
      aov: monthAov,
      promoUses: monthPromoUses,
      statusCounts,
    },
    today: {
      orders: todayOrders.length,
      revenue: todayRevenue,
    },
    recent: orders.slice(0, 10),
    allTime: {
      revenue: allTimeRevenue,
    },
    series30d: seriesRows.map((r) => ({
      day: r.day,
      revenue: Number(r.revenue ?? 0),
      orders_count: Number(r.orders_count ?? 0),
    })),
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()
  if (!stats) return null

  return (
    <div className="space-y-6 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.45)] backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
          Home administrateur
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/55">
          Gestion du catalogue, du contenu, et suivi des commandes — entièrement séparé du site.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[
            { label: "Produits", value: stats.counts.products },
            { label: "Catégories", value: stats.counts.categories },
            { label: "Commandes", value: stats.counts.orders },
            { label: "Clients", value: stats.counts.customers },
          ].map((k) => (
            <div key={k.label} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">{k.label}</p>
              <p className="mt-1 text-2xl font-semibold text-white">{k.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">CA (mois)</p>
                  <p className="mt-2 text-3xl font-semibold">{formatFcfa(stats.month.revenue)}</p>
                  <p className="mt-2 text-xs text-white/55">
                    Aujourd’hui : {formatFcfa(stats.today.revenue)} · {stats.today.orders} commande(s)
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-[#b38b6d]">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                    CA (historique)
                  </p>
                  <p className="mt-2 text-3xl font-semibold">{formatFcfa(stats.allTime.revenue)}</p>
                  <p className="mt-2 text-xs text-white/55">Total cumulé des commandes.</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-[#b38b6d]">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">Commandes (mois)</p>
                  <p className="mt-2 text-3xl font-semibold">{stats.month.orders}</p>
                  <p className="mt-2 text-xs text-white/55">Panier moyen : {formatFcfa(stats.month.aov)}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-[#b38b6d]">
                  <ShoppingCart className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">Clients</p>
                  <p className="mt-2 text-3xl font-semibold">{stats.counts.customers}</p>
                  <p className="mt-2 text-xs text-white/55">Base clients cumulée (auto via commandes)</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-[#b38b6d]">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">Codes promo (mois)</p>
                  <p className="mt-2 text-3xl font-semibold">{stats.month.promoUses}</p>
                  <p className="mt-2 text-xs text-white/55">Nombre de commandes avec code promo</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-[#b38b6d]">
                  <BadgePercent className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          <DashboardCharts series={stats.series30d} />

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">Dernières commandes</p>
            {stats.recent.length === 0 ? (
              <p className="mt-4 text-sm text-white/55">Aucune commande.</p>
            ) : (
              <div className="mt-4 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10">
                {stats.recent.slice(0, 8).map((o) => (
                  <div key={o.id} className="flex flex-col gap-2 bg-black/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs font-semibold text-white/85">{o.id}</p>
                      <p className="mt-1 text-[11px] text-white/45">
                        {new Date(o.created_at).toLocaleString("fr-FR")}
                        {o.promo_code ? ` · promo ${o.promo_code}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] font-semibold text-white/70">
                        {o.status}
                      </span>
                      <span className="text-sm font-semibold">{formatFcfa(o.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">Statuts (mois)</p>
          <div className="mt-4 space-y-2">
            {Object.keys(stats.month.statusCounts).length === 0 ? (
              <p className="text-sm text-white/55">Pas de données ce mois-ci.</p>
            ) : (
              Object.entries(stats.month.statusCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                    <span className="text-xs font-semibold text-white/75">{status}</span>
                    <span className="text-xs font-semibold text-white">{count}</span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
