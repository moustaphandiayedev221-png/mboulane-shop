import type { SupabaseClient } from "@supabase/supabase-js"

/** PostgREST quand la colonne `subtitle` n’existe pas encore en base / cache schéma. */
export function isSubtitleSchemaError(message: string | undefined): boolean {
  if (!message) return false
  return message.includes("subtitle") && (message.includes("schema") || message.includes("column"))
}

type CatRow = {
  id: number
  label: string
  sort_order: number
  image: string | null
  image_storage_path: string | null
  subtitle?: string | null
}

/** Liste admin : avec `subtitle` si la colonne existe, sinon sans. */
export async function adminSelectCategories(admin: SupabaseClient) {
  const full = await admin
    .from("categories")
    .select("id,label,sort_order,image,image_storage_path,subtitle")
    .order("sort_order", { ascending: true })

  if (!full.error) {
    return { data: full.data as CatRow[] | null, error: null as null }
  }
  if (!isSubtitleSchemaError(full.error.message)) {
    return { data: null, error: full.error }
  }

  const slim = await admin
    .from("categories")
    .select("id,label,sort_order,image,image_storage_path")
    .order("sort_order", { ascending: true })

  if (slim.error) return { data: null, error: slim.error }

  const withNullSubtitle = (slim.data ?? []).map((r) => ({
    ...(r as CatRow),
    subtitle: null as string | null,
  }))
  return { data: withNullSubtitle, error: null }
}

export function omitSubtitle<T extends Record<string, unknown>>(row: T): Omit<T, "subtitle"> {
  const { subtitle: _s, ...rest } = row
  return rest as Omit<T, "subtitle">
}
