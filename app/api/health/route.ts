import { NextResponse } from "next/server"
import { getAllowedAdminEmails } from "@/lib/admin/auth"
import {
  getCatalogApiKey,
  getDeploymentWarnings,
  isUpstashRedisConfigured,
} from "@/lib/deployment/config"
import { createPublicServerClient } from "@/lib/supabase/public-server"

/** Santé déploiement : DB + RPC attendues (migration 016) + signaux de configuration. */
export async function GET() {
  try {
    const supabase = createPublicServerClient()
    const [{ data: rpcs, error: rpcErr }, { error: pingErr }] = await Promise.all([
      supabase.rpc("deployment_health"),
      supabase.from("products").select("id").limit(1).maybeSingle(),
    ])

    if (rpcErr) {
      return NextResponse.json(
        { ok: false, error: rpcErr.message, hint: "Appliquer supabase/migrations/016_*.sql" },
        { status: 503 },
      )
    }

    if (pingErr) {
      return NextResponse.json({ ok: false, error: pingErr.message }, { status: 503 })
    }

    const checks = (rpcs ?? {}) as Record<string, boolean>
    const allRpcs = Object.values(checks).every(Boolean)
    const warnings = getDeploymentWarnings()

    return NextResponse.json({
      ok: allRpcs,
      checks: { ...checks, products_ping: true },
      config: {
        adminEmailsConfigured: getAllowedAdminEmails().length > 0,
        upstashRedis: isUpstashRedisConfigured(),
        catalogApiKeyConfigured: Boolean(getCatalogApiKey()),
      },
      ...(warnings.length ? { warnings } : {}),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown"
    return NextResponse.json({ ok: false, error: msg }, { status: 503 })
  }
}
