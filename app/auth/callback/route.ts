import { NextResponse } from "next/server"

import { normalizeRedirectPath } from "@/lib/auth/types"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = normalizeRedirectPath(requestUrl.searchParams.get("next"), "/dashboard")
  const providerError =
    requestUrl.searchParams.get("error_description") ?? requestUrl.searchParams.get("error")

  if (providerError) {
    const loginUrl = new URL("/connexion", requestUrl.origin)
    loginUrl.searchParams.set("error", providerError)
    loginUrl.searchParams.set("next", next)
    return NextResponse.redirect(loginUrl)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      const loginUrl = new URL("/connexion", requestUrl.origin)
      loginUrl.searchParams.set("error", error.message)
      loginUrl.searchParams.set("next", next)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
