import { NextResponse } from "next/server"

import { getCurrentAuthState } from "@/lib/auth/server"
import { isAdminRole } from "@/lib/auth/types"
import { getSentryIssues } from "@/lib/sentry/issues"

export async function GET() {
  const { profile } = await getCurrentAuthState()

  if (!profile || !profile.is_active || !isAdminRole(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const result = await getSentryIssues()
  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store",
    },
  })
}
