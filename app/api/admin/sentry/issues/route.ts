import { NextResponse } from "next/server"

import { getCurrentAuthState } from "@/lib/auth/server"
import { isAdminRole } from "@/lib/auth/types"
import { getSentryIssues, resolveSentryIssue } from "@/lib/sentry/issues"

async function requireAdminAccess() {
  const { profile } = await getCurrentAuthState()

  return Boolean(profile && profile.is_active && isAdminRole(profile.role))
}

export async function GET() {
  if (!(await requireAdminAccess())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const result = await getSentryIssues()
  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store",
    },
  })
}

export async function PATCH(request: Request) {
  if (!(await requireAdminAccess())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let payload: { issueId?: unknown }

  try {
    payload = (await request.json()) as { issueId?: unknown }
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 })
  }

  if (typeof payload.issueId !== "string") {
    return NextResponse.json({ error: "Issue Sentry manquante." }, { status: 400 })
  }

  const result = await resolveSentryIssue(payload.issueId)

  if (!result.ok) {
    return NextResponse.json(result, { status: 502 })
  }

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store",
    },
  })
}
