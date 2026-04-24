import { NextResponse } from "next/server"
import { isPublicSiteSettingKey } from "@/lib/site/public-setting-keys"
import { createPublicServerClient } from "@/lib/supabase/public-server"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params
  if (!isPublicSiteSettingKey(key)) {
    return NextResponse.json({ error: "Clé non exposée" }, { status: 404 })
  }
  try {
    const supabase = createPublicServerClient()
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ value: null })
    }
    return NextResponse.json({ value: data?.value ?? null })
  } catch {
    return NextResponse.json({ value: null })
  }
}

