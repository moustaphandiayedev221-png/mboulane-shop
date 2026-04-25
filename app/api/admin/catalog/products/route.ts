import { NextResponse } from "next/server"
import { z } from "zod"
import { createServiceRoleClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/admin/auth"
import { revalidatePath, revalidateTag } from "next/cache"

const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  original_price: z.number().nonnegative().optional().nullable(),
  image: z.string().min(1),
  images: z.array(z.string()).default([]),
  image_storage_path: z.string().optional().nullable(),
  images_storage_paths: z.array(z.string()).default([]),
  home_section: z
    .enum(["best_sellers", "premium_luxe", "nouveautes", "collection_artisanale"])
    .optional()
    .nullable(),
  color_variants: z
    .array(
      z.object({
        color: z.string().min(1),
        images: z.array(z.string()).default([]),
        images_storage_paths: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  description: z.string().min(1),
  category: z.string().min(1),
  sizes: z.array(z.number().int()).default([]),
  colors: z.array(z.string()).default([]),
  in_stock: z.boolean().default(true),
  stock_quantity: z.number().int().optional().nullable(),
  badge: z.string().optional().nullable(),
  rating: z.number().optional().default(0),
  review_count: z.number().int().optional().default(0),
  sort_order: z.number().int().optional().default(0),
})

export async function GET() {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })

  const admin = createServiceRoleClient()
  const { data, error } = await admin
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ products: data ?? [] })
}

export async function POST(req: Request) {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })

  const body = await req.json().catch(() => null)
  const parsed = productSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const admin = createServiceRoleClient()
  const { error } = await admin.from("products").upsert(parsed.data, { onConflict: "id" })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidateTag("catalog.products", "page")
  revalidatePath("/")
  revalidatePath("/boutique")

  return NextResponse.json({ ok: true })
}

