import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Build-time safety: If env vars are missing, return a mock object to prevent crashing
    if (!supabaseUrl || !supabaseKey) {
        const mockQueryBuilder = {
            select: () => mockQueryBuilder,
            eq: () => mockQueryBuilder,
            single: () => Promise.resolve({ data: null, error: null }),
            order: () => mockQueryBuilder,
            limit: () => mockQueryBuilder,
            then: (resolve: any) => resolve({ data: [], error: null }),
        } as any

        return {
            from: () => mockQueryBuilder,
            auth: {
                getUser: () => Promise.resolve({ data: { user: null }, error: null }),
                getSession: () => Promise.resolve({ data: { session: null }, error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            }
        } as any
    }

    const cookieStore = cookies()

    return createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
                        )
                    } catch {
                        // Server component — ignore
                    }
                },
            },
        }
    )
}
