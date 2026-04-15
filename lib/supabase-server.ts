import "server-only"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Server client with user session (uses cookies). Use in Server Components and Route Handlers.
export async function createServerSupabase() {
  const cookieStore = await cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: CookieOptions }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // Called from a Server Component; middleware will refresh the session.
        }
      },
    },
  })
}

// Service-role client for privileged backend work (webhooks, cron, admin).
// NEVER import from a client component.
export function createServiceSupabase() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set")
  return createSupabaseClient(SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function getSessionUser() {
  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.getUser()
  return data.user ?? null
}
