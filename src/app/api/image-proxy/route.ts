import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/image-proxy?url=<encoded pollinations url>
 *
 * Proxies images from image.pollinations.ai through our own server so the
 * browser treats them as same-origin and avoids ERR_BLOCKED_BY_ORB (ORB
 * blocks cross-origin image responses that lack proper CORS headers).
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const rawUrl = searchParams.get('url')

    if (!rawUrl) {
        return NextResponse.json({ error: 'url param required' }, { status: 400 })
    }

    // Only allow Pollinations.ai URLs for security
    let target: URL
    try {
        target = new URL(rawUrl)
    } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    if (!target.hostname.endsWith('pollinations.ai')) {
        return NextResponse.json({ error: 'Only pollinations.ai images are proxied' }, { status: 403 })
    }

    try {
        const upstream = await fetch(rawUrl, {
            headers: {
                'User-Agent': 'Duoshinki/1.0 (Education AI; +https://duoshinki.com)',
                'Accept': 'image/webp,image/png,image/jpeg,*/*',
            },
            // Pollinations can take a while to generate — give it 60s
            signal: AbortSignal.timeout(60000),
        })

        if (!upstream.ok) {
            return NextResponse.json({ error: `Upstream ${upstream.status}` }, { status: 502 })
        }

        const contentType = upstream.headers.get('content-type') || 'image/jpeg'
        const buffer = await upstream.arrayBuffer()

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
                'Access-Control-Allow-Origin': '*',
            },
        })
    } catch (err) {
        console.error('Image proxy error:', err)
        return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 })
    }
}
