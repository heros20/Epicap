import { createBrowserClient } from "@supabase/ssr"

import { getSupabasePublicEnv } from "@/lib/supabase/config"
import type { Database } from "@/types/supabase"

export function createClient() {
  const supabaseEnv = getSupabasePublicEnv()

  if (!supabaseEnv) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    )
  }

  return createBrowserClient<Database>(
    supabaseEnv.url,
    supabaseEnv.anonKey,
  )
}
