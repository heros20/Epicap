"use client"

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
} from "react"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"

import type { AuthUser, ProfileWithCompany } from "@/lib/auth/types"
import { createClient } from "@/lib/supabase/client"

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
  initialUser,
  initialProfile,
}: {
  children: ReactNode
  initialUser: AuthUser | null
  initialProfile: ProfileWithCompany | null
}) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      startTransition(() => {
        router.refresh()
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  return (
    <AuthContext.Provider
      value={{
        user: initialUser,
        profile: initialProfile,
        isAuthenticated: Boolean(initialUser),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
