import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/admin"
import { assertAdmin } from "@/lib/admin/auth"
import { sniffImageMime } from "@/lib/images/sniff-mime"

export const runtime = "nodejs"

const ALLOWED_BUCKETS = new Set(["product-images", "site-images"])

const ALLOWED_IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

/** Plafonds anti-saturation storage (admin authentifié uniquement). */
const MAX_FILES_PER_REQUEST = 20
const MAX_BYTES_PER_FILE = 8 * 1024 * 1024 // 8 Mo
const MAX_TOTAL_BYTES = 40 * 1024 * 1024 // 40 Mo par requête

function extFromMime(type: string) {
  if (type === "image/png") return "png"
  if (type === "image/webp") return "webp"
  if (type === "image/gif") return "gif"
  return "jpg"
}

function stripKnownImageExt(filename: string) {
  return filename.replace(/\.(png|jpg|jpeg|webp|gif)$/i, "")
}

export async function POST(req: Request) {
  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })

  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: "FormData invalide" }, { status: 400 })

  const bucketName = String(form.get("bucket") || "product-images")
  if (!ALLOWED_BUCKETS.has(bucketName)) {
    return NextResponse.json({ error: "Bucket non autorisé" }, { status: 400 })
  }

  const folder = String(form.get("folder") || "uploads").replace(/[^a-zA-Z0-9/_-]/g, "")
  const files = form.getAll("files").filter((f) => f instanceof File) as File[]
  if (files.length === 0) return NextResponse.json({ error: "Aucun fichier" }, { status: 400 })
  if (files.length > MAX_FILES_PER_REQUEST) {
    return NextResponse.json(
      { error: `Trop de fichiers (max ${MAX_FILES_PER_REQUEST} par envoi)` },
      { status: 400 },
    )
  }

  let totalBytes = 0
  for (const file of files) {
    if (file.size > MAX_BYTES_PER_FILE) {
      return NextResponse.json(
        { error: `Fichier trop volumineux (max ${MAX_BYTES_PER_FILE / (1024 * 1024)} Mo chacun)` },
        { status: 400 },
      )
    }
    totalBytes += file.size
  }
  if (totalBytes > MAX_TOTAL_BYTES) {
    return NextResponse.json(
      { error: `Volume total trop important (max ${MAX_TOTAL_BYTES / (1024 * 1024)} Mo par envoi)` },
      { status: 400 },
    )
  }

  const supabase = createServiceRoleClient()
  const bucket = supabase.storage.from(bucketName)

  const uploaded: Array<{ path: string; url: string }> = []

  for (const file of files) {
    const head = new Uint8Array(await file.slice(0, 16).arrayBuffer())
    const sniffed = sniffImageMime(head)
    if (!sniffed || !ALLOWED_IMAGE_MIMES.has(sniffed)) {
      return NextResponse.json(
        { error: "Fichier non reconnu comme image (JPEG, PNG, WebP ou GIF)." },
        { status: 400 },
      )
    }
    const ext = extFromMime(sniffed)
    const rawBase = stripKnownImageExt(file.name || "image")
    const safeBase = rawBase.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80)
    const nonce = `${Date.now()}-${Math.floor(Math.random() * 1e9)}`
    const path = `${folder}/${nonce}-${safeBase}.${ext}`.replace(/\/+/g, "/")

    const { error } = await bucket.upload(path, file, {
      upsert: false,
      contentType: sniffed,
      cacheControl: "3600",
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data } = bucket.getPublicUrl(path)
    uploaded.push({ path, url: data.publicUrl })
  }

  return NextResponse.json({ uploaded })
}

