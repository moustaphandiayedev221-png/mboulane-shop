import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/admin"
import { adminSelectCategories, isSubtitleSchemaError, omitSubtitle } from "@/lib/admin/categories-subtitle-compat"
import { assertAdmin } from "@/lib/admin/auth"
import {
  HOME_COLLECTION_LABELS,
  HOME_COLLECTION_LOCAL_IMAGES,
  HOME_COLLECTION_SUBTITLES,
} from "@/lib/catalog/collection-labels"

/** Insère ou met à jour les 4 collections d’accueil (même logique que le seed CLI). */
export async function POST() {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })

  const admin = createServiceRoleClient()
  const catRows = HOME_COLLECTION_LABELS.map((label, i) => ({
    label,
    sort_order: i,
    subtitle: HOME_COLLECTION_SUBTITLES[label],
    image: HOME_COLLECTION_LOCAL_IMAGES[label],
    image_storage_path: null as string | null,
  }))

  let { error } = await admin.from("categories").upsert(catRows, {
    onConflict: "label",
    ignoreDuplicates: false,
  })
  if (error && isSubtitleSchemaError(error.message)) {
    const slimRows = catRows.map((r) => omitSubtitle(r as Record<string, unknown>))
    ;({ error } = await admin.from("categories").upsert(slimRows, {
      onConflict: "label",
      ignoreDuplicates: false,
    }))
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data, error: selErr } = await adminSelectCategories(admin)
  if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 })
  return NextResponse.json({ ok: true, categories: data ?? [] })
}
