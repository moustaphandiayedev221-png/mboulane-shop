/**
 * Upload les 4 visuels `public/collections/*.png` vers le bucket `site-images`
 * et met à jour `public.categories` (image + image_storage_path).
 *
 * Prérequis : .env.local avec NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *
 * npm run db:migrate-collections
 */

import dotenv from "dotenv"
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createServiceRoleClient } from "@/lib/supabase/admin"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
dotenv.config()

const PAIRS: { label: string; filename: string }[] = [
  { label: "Classique", filename: "classique.png" },
  { label: "Mode & Tendance", filename: "mode-et-tendance.png" },
  { label: "Premium", filename: "premium.png" },
  { label: "Artisanal & Unique", filename: "artisanal-et-unique.png" },
]

async function main() {
  const supabase = createServiceRoleClient()
  const bucket = supabase.storage.from("site-images")
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const publicDir = path.resolve(__dirname, "..", "public", "collections")

  for (const { label, filename } of PAIRS) {
    const localPath = path.join(publicDir, filename)
    const bytes = await fs.readFile(localPath)
    const storagePath = `collections/${filename}`

    const { error: upErr } = await bucket.upload(storagePath, bytes, {
      contentType: "image/png",
      cacheControl: "86400",
      upsert: true,
    })
    if (upErr) throw new Error(`${label}: upload — ${upErr.message}`)

    const { data } = bucket.getPublicUrl(storagePath)
    const publicUrl = data.publicUrl

    const { error: dbErr } = await supabase
      .from("categories")
      .update({
        image: publicUrl,
        image_storage_path: storagePath,
      })
      .eq("label", label)

    if (dbErr) throw new Error(`${label}: categories — ${dbErr.message}`)
    console.log(`OK: ${label} → ${publicUrl}`)
  }

  console.log("Terminé : 4 collections mises à jour dans Supabase.")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
