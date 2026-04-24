"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import { Loader2, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type UploadedImage = { url: string; path: string }

export function ImagePicker({
  label,
  bucket = "product-images",
  folder,
  multiple = false,
  value,
  onChange,
}: {
  label: string
  bucket?: "product-images" | "site-images"
  folder: string
  multiple?: boolean
  value: UploadedImage[]
  onChange: (next: UploadedImage[]) => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pick = () => inputRef.current?.click()

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.set("bucket", bucket)
      fd.set("folder", folder)
      Array.from(files).forEach((f) => fd.append("files", f))

      const res = await fetch("/api/admin/storage/upload", { method: "POST", body: fd })
      const data = (await res.json()) as { uploaded?: UploadedImage[]; error?: string }
      if (!res.ok) throw new Error(data.error || "Upload échoué")
      const uploaded = Array.isArray(data.uploaded) ? data.uploaded : []

      if (multiple) onChange([...value, ...uploaded])
      else onChange(uploaded.slice(0, 1))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur upload")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">{label}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => void upload(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl border-white/10 bg-black/20 text-white"
          onClick={pick}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {multiple ? "Ajouter" : "Choisir"}
        </Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {value.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/55">
          Aucune image.
        </div>
      ) : (
        <div className={cn("grid gap-3", multiple ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1")}>
          {value.map((img) => (
            <div key={img.path} className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/20">
              <div className={cn("relative w-full", multiple ? "aspect-[4/3]" : "aspect-[16/9]")}>
                <Image src={img.url} alt="upload" fill className="object-cover" sizes="(max-width: 768px) 50vw, 200px" />
              </div>
              <div className="flex items-center justify-between gap-2 p-2">
                <p className="truncate text-[11px] text-white/55">{img.path.split("/").slice(-1)[0]}</p>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-lg border-white/10 bg-black/20 text-white hover:text-red-200"
                  onClick={() => onChange(value.filter((v) => v.path !== img.path))}
                  title="Retirer"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

