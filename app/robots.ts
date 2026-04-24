import { MetadataRoute } from "next"
import { getSiteBaseUrl } from "@/lib/site/base-url"

export default function robots(): MetadataRoute.Robots {
  const base = getSiteBaseUrl()
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/checkout", "/api/"] },
    sitemap: `${base}/sitemap.xml`,
  }
}
