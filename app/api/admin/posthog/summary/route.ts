import { NextResponse } from "next/server"

import { getCurrentAuthState } from "@/lib/auth/server"
import { isAdminRole } from "@/lib/auth/types"
import { getPostHogSummary, parsePostHogRange } from "@/lib/posthog/analytics"

export async function GET(request: Request) {
  const { profile } = await getCurrentAuthState()

  if (!profile || !profile.is_active || !isAdminRole(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const url = new URL(request.url)
  const result = await getPostHogSummary({
    range: parsePostHogRange(url.searchParams.get("range")),
  })

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store",
    },
  })
}
