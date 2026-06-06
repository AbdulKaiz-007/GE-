import { createBrowserClient } from '@supabase/ssr'

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
                getSession: () => Promise.resolve({ data: { session: null }, error: null }),
                getUser: () => Promise.resolve({ data: { user: null }, error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
                signInWithPassword: () => Promise.resolve({ data: {}, error: null }),
                signUp: () => Promise.resolve({ data: {}, error: null }),
                signOut: () => Promise.resolve({ data: {}, error: null }),
            }
        } as any
    }

    return createBrowserClient(
        supabaseUrl,
        supabaseKey
    )
}
