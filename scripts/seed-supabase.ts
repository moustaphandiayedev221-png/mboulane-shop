/**
 * Peuple Supabase depuis lib/data/products.ts (service role).
 * Prérequis : schéma en base — `npm run db:migrate` ou exécution manuelle du SQL.
 *
 * npm run db:seed  |  tout-en-un : npm run db:setup
 */

import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"
import {
  products,
  reviews,
  COLOR_MAP,
} from "../lib/data/products"
import {
  HOME_COLLECTION_LABELS,
  HOME_COLLECTION_SUBTITLES,
} from "../lib/catalog/collection-labels"
import {
  DEFAULT_ARTISANAL_HOME,
  DEFAULT_WHY_CHOOSE_HOME,
  HOME_ARTISANAL_KEY,
  HOME_WHY_CHOOSE_KEY,
} from "../lib/site/home-sections"
import { ABOUT_PAGE_KEY, DEFAULT_ABOUT_PAGE } from "../lib/site/about-page"

dotenv.config({ path: ".env.local" })
dotenv.config()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error(
    "Manque NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY dans .env.local",
  )
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  const catRows = HOME_COLLECTION_LABELS.map((label, i) => ({
    label,
    sort_order: i,
    subtitle: HOME_COLLECTION_SUBTITLES[label],
  }))
  const { error: ce } = await supabase.from("categories").upsert(catRows, {
    onConflict: "label",
    ignoreDuplicates: false,
  })
  if (ce) console.warn("categories:", ce.message)

  const { error: homeErr } = await supabase.from("site_settings").upsert(
    [
      { key: HOME_ARTISANAL_KEY, value: DEFAULT_ARTISANAL_HOME },
      { key: HOME_WHY_CHOOSE_KEY, value: DEFAULT_WHY_CHOOSE_HOME },
      { key: ABOUT_PAGE_KEY, value: DEFAULT_ABOUT_PAGE },
    ],
    { onConflict: "key", ignoreDuplicates: false },
  )
  if (homeErr) console.warn("site_settings (accueil / à propos):", homeErr.message)

  const colorRows = Object.entries(COLOR_MAP).map(([color_name, hex_value]) => ({
    color_name,
    hex_value,
  }))
  const { error: cole } = await supabase.from("color_swatches").upsert(colorRows, {
    onConflict: "color_name",
    ignoreDuplicates: false,
  })
  if (cole) console.warn("color_swatches:", cole.message)

  const productRows = products.map((p, i) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    original_price: p.originalPrice ?? null,
    image: p.image,
    images: p.images,
    description: p.description,
    category: p.category,
    sizes: p.sizes,
    colors: p.colors,
    in_stock: p.inStock,
    stock_quantity: 999,
    badge: p.badge ?? null,
    rating: p.rating,
    review_count: p.reviews,
    sort_order: i + 1,
  }))
  const { error: pe } = await supabase.from("products").upsert(productRows, {
    onConflict: "id",
    ignoreDuplicates: false,
  })
  if (pe) {
    console.error("products:", pe)
    process.exit(1)
  }

  const reviewRows = reviews.map((r, i) => ({
    id: r.id,
    name: r.name,
    location: r.location,
    rating: r.rating,
    comment: r.comment,
    review_date: r.date,
    verified: r.verified,
    sort_order: i,
  }))
  const { error: re } = await supabase.from("customer_reviews").upsert(reviewRows, {
    onConflict: "id",
    ignoreDuplicates: false,
  })
  if (re) console.warn("customer_reviews:", re.message)

  console.log(
    `OK — ${productRows.length} produits, ${reviewRows.length} avis, ${catRows.length} catégories, ${colorRows.length} couleurs.`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
