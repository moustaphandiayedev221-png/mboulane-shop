import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"

export async function updateSession(request: NextRequest) {
  const incomingRid = request.headers.get("x-request-id")?.trim()
  const requestId = incomingRid && incomingRid.length > 0 ? incomingRid : crypto.randomUUID()
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-request-id", requestId)

  const modifiedRequest = new NextRequest(request, { headers: requestHeaders })

  let supabaseResponse = NextResponse.next({
    request: modifiedRequest,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  await supabase.auth.getUser()

  supabaseResponse.headers.set("x-request-id", requestId)
  return supabaseResponse
}
