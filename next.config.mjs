import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function supabaseStorageImageRemotePatterns() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!url) return []
  try {
    const hostname = new URL(url).hostname
    if (!hostname) return []
    return [
      {
        protocol: "https",
        hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ]
  } catch {
    return []
  }
}

function securityHeaders() {
  const prod = process.env.VERCEL === "1" || process.env.NODE_ENV === "production"

  const base = [
    { key: "X-DNS-Prefetch-Control", value: "on" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "DENY" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=()",
    },
  ]

  if (prod) {
    const scriptSrc = [
      "'self'",
      "'unsafe-inline'",
      "https://va.vercel-scripts.com",
      "https://vercel.live",
    ].join(" ")
    const csp = [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vitals.vercel-insights.com https://va.vercel-scripts.com https://vercel.live https://*.sentry.io",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ")
    base.push({ key: "Content-Security-Policy", value: csp })
    base.push({
      key: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains; preload",
    })
  }

  return base
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1", "0.0.0.0", "192.168.1.31"],
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/brand-ms-logo.png" }]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders(),
      },
    ]
  },
  turbopack: {
    // Toujours pointer vers le dossier du projet (évite écran blanc si le dossier est déplacé)
    root: __dirname,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: false,
    remotePatterns: supabaseStorageImageRemotePatterns(),
  },
}

export default nextConfig
