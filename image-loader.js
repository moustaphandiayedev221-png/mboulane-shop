/**
 * Global custom image loader for Next.js.
 * 
 * Delegates image optimization to Supabase's built-in image transformation API
 * instead of Vercel's image optimizer (which has quota limits on the free tier).
 * 
 * For Supabase storage URLs, it rewrites the path from /object/public/ to
 * /render/image/public/ and appends width, quality, and format parameters.
 * This returns optimized WebP images directly from the Supabase CDN.
 * 
 * For non-Supabase URLs (e.g. local /brand-ms-logo.png), it returns them as-is.
 */
export default function supabaseImageLoader({ src, width, quality }) {
  // Handle Supabase storage URLs — delegate optimization to Supabase CDN
  if (src.includes("supabase.co/storage/v1/object/public/")) {
    const renderUrl = src.replace("/object/public/", "/render/image/public/")
    const params = new URLSearchParams()
    params.set("width", width.toString())
    params.set("resize", "contain")
    params.set("quality", (quality || 75).toString())
    params.set("format", "webp")
    return `${renderUrl}?${params.toString()}`
  }

  // For local/static images, return as-is (they don't need external optimization)
  return src
}
