import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED: string[] = [] // Temporarily disabled: ['/dashboard', '/battle', '/profile', '/comics', '/leaderboard', '/verify', '/lessons', '/comic-book']
const AUTH_ONLY: string[] = [] // Temporarily disabled: ['/login', '/register']

export async function middleware(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If env vars are missing, just continue (likely build time or first run)
    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.next()
    }

    // Create an unmodified response
    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    console.log(`[Middleware] Path: ${request.nextUrl.pathname}`)
    console.log(`[Middleware] User exists: ${!!user}`, error ? `Error: ${error.message}` : '')

    const pathname = request.nextUrl.pathname
    const isProtected = PROTECTED.some(p => pathname.startsWith(p))
    const isAuthPage = AUTH_ONLY.some(p => pathname.startsWith(p))

    if (isProtected && !user) {
        console.log(`[Middleware] Redirecting to /login (Protected route, no user)`)
        const url = new URL('/login', request.url)
        url.searchParams.set('redirect', pathname)
        return NextResponse.redirect(url)
    }

    if (isAuthPage && user) {
        console.log(`[Middleware] Redirecting to /dashboard (Auth page, user exists)`)
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
