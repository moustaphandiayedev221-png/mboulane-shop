export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getDeploymentWarnings } = await import("@/lib/deployment/config")
    for (const msg of getDeploymentWarnings()) {
      console.warn("[mboulaneshop]", msg)
    }
  }

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
  if (!dsn) return

  if (process.env.NEXT_RUNTIME === "nodejs") {
    const Sentry = await import("@sentry/nextjs")
    Sentry.init({
      dsn,
      tracesSampleRate: 0.05,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
    })
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const Sentry = await import("@sentry/nextjs")
    Sentry.init({
      dsn,
      tracesSampleRate: 0,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
    })
  }
}
