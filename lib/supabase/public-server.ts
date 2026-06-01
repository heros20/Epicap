import { createServerClient } from "@supabase/ssr"

import { getSupabasePublicEnv } from "@/lib/supabase/config"
import type { Database } from "@/types/supabase"

export function createPublicServerClient() {
  const supabaseEnv = getSupabasePublicEnv()

  if (!supabaseEnv) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    )
  }

  return createServerClient<Database>(supabaseEnv.url, supabaseEnv.anonKey, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {
        // Public catalogue reads do not need request cookies.
      },
    },
  })
}
