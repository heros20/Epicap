import { redirect } from "next/navigation"

import type { AuthUser, ProfileWithCompany } from "@/lib/auth/types"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/supabase"

type ProfileSelectRow = Database["public"]["Tables"]["profiles"]["Row"] & {
  company: ProfileWithCompany["company"]
}

export async function getCurrentAuthState() {
  if (!isSupabaseConfigured()) {
    return {
      supabase: null,
      user: null as AuthUser | null,
      profile: null as ProfileWithCompany | null,
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      supabase,
      user: null as AuthUser | null,
      profile: null as ProfileWithCompany | null,
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, company_id, company_name, first_name, last_name, email, phone, job_title, role, is_active, email_notifications, created_at, updated_at, company:companies(id, name, siret, email, phone, website, payment_terms, discount_percentage)",
    )
    .eq("id", user.id)
    .maybeSingle<ProfileSelectRow>()

  return {
    supabase,
    user: {
      id: user.id,
      email: user.email ?? null,
    } satisfies AuthUser,
    profile: profile ?? null,
  }
}

export async function requireAuthenticatedUser(next = "/dashboard") {
  const authState = await getCurrentAuthState()

  if (!authState.user) {
    redirect(`/connexion?next=${encodeURIComponent(next)}`)
  }

  return authState
}

export async function requireProfile(next = "/dashboard") {
  const authState = await requireAuthenticatedUser(next)

  if (!authState.profile) {
    redirect("/forbidden?reason=missing-profile")
  }

  if (!authState.profile.is_active) {
    redirect("/forbidden?reason=inactive")
  }

  return authState as typeof authState & { profile: ProfileWithCompany; user: AuthUser }
}

export async function requireRole(
  roles: Array<ProfileWithCompany["role"]>,
  next = "/dashboard",
) {
  const authState = await requireProfile(next)

  if (!roles.includes(authState.profile.role)) {
    redirect("/forbidden?reason=role")
  }

  return authState
}
