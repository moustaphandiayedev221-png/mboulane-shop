import dotenv from "dotenv"
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createServiceRoleClient } from "@/lib/supabase/admin"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

async function main() {
  const supabase = createServiceRoleClient()

  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const heroPath = path.resolve(__dirname, "..", "public", "hero-mboulane.png")
  const bytes = await fs.readFile(heroPath)

  const storagePath = `hero/${Date.now()}-hero-mboulane.png`
  const bucket = supabase.storage.from("site-images")

  // Upload (upsert true to allow rerun)
  const { error: upErr } = await bucket.upload(storagePath, bytes, {
    contentType: "image/png",
    cacheControl: "3600",
    upsert: true,
  })
  if (upErr) throw new Error(upErr.message)

  const { data } = bucket.getPublicUrl(storagePath)
  const publicUrl = data.publicUrl

  const heroValue = {
    title: "L’élégance africaine à vos pieds",
    subtitle: "Sandales premium en cuir, fabriquées avec passion au Sénégal.",
    ctaLabel: "Découvrir la boutique",
    ctaHref: "/boutique",
    backgroundImage: publicUrl,
    backgroundImageStoragePath: storagePath,
  }

  const { error: setErr } = await supabase.from("site_settings").upsert(
    {
      key: "hero",
      value: heroValue,
    },
    { onConflict: "key" },
  )
  if (setErr) throw new Error(setErr.message)

  console.log("OK: Hero migré vers Supabase Storage:", publicUrl)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

