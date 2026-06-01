"use client"

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
} from "react"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"

import type { AuthUser, ProfileWithCompany } from "@/lib/auth/types"
import { isSupabaseConfigured } from "@/lib/supabase/config"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/supabase"

type ProfileSelectRow = Database["public"]["Tables"]["profiles"]["Row"] & {
  company: ProfileWithCompany["company"]
}

const PROFILE_SELECT =
  "id, company_id, company_name, first_name, last_name, email, phone, job_title, role, is_active, email_notifications, created_at, updated_at, company:companies(id, name, siret, email, phone, website, payment_terms, discount_percentage)"

interface AuthContextValue {
  user: AuthUser | null
  profile: ProfileWithCompany | null
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  isAuthenticated: false,
})

export function AuthProvider({
  children,
  initialUser = null,
  initialProfile = null,
}: {
  children: ReactNode
  initialUser?: AuthUser | null
  initialProfile?: ProfileWithCompany | null
}) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(initialUser)
  const [profile, setProfile] = useState<ProfileWithCompany | null>(initialProfile)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return
    }

    const supabase = createClient()

    async function refreshAuthState(shouldRefreshRoute = false) {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        setUser(null)
        setProfile(null)
      } else {
        setUser({
          id: authUser.id,
          email: authUser.email ?? null,
        })

        const { data: profileData } = await supabase
          .from("profiles")
          .select(PROFILE_SELECT)
          .eq("id", authUser.id)
          .maybeSingle<ProfileSelectRow>()

        setProfile(profileData ?? null)
      }

      if (shouldRefreshRoute) {
        startTransition(() => {
          router.refresh()
        })
      }
    }

    if (!initialUser) {
      void refreshAuthState()
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshAuthState(true)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [initialUser, router])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
