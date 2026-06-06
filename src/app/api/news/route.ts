import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const query = searchParams.get('q')

    const apiKey = process.env.NEWS_API?.trim()

    if (!apiKey) {
        return NextResponse.json({ error: 'NEWS_API_KEY_MISSING' }, { status: 500 })
    }

    // Map internal categories to NewsData.io categories
    let apiCategory = ''
    if (category) {
        switch (category) {
            case 'Technology': apiCategory = 'technology'; break;
            case 'Science & Health': apiCategory = 'science,health'; break;
            case 'Business & Finance': apiCategory = 'business'; break;
            case 'World & Society': apiCategory = 'world,politics,environment'; break;
            case 'Education & Campus': apiCategory = 'education'; break;
            case 'Industry & Jobs': apiCategory = 'business'; break;
            default: apiCategory = 'top';
        }
    }

    // Build URL
    // Default to 'en' language and some logical countries if global news is too noisy, 
    // but global 'en' is usually best for "Chronicles".
    let url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&language=en`
    
    if (apiCategory && apiCategory !== 'top' && !query) {
        url += `&category=${apiCategory}`
    }
    
    if (query) {
        url += `&q=${encodeURIComponent(query)}`
    }

    try {
        const response = await fetch(url, { next: { revalidate: 3600 } }) // Cache for 1 hour
        const data = await response.json()

        if (data.status !== 'success') {
            return NextResponse.json({ error: 'NEWSDATA_API_ERROR', details: data }, { status: 502 })
        }

        // Map to our internal NewsItem format
        const items = data.results.map((item: any) => ({
            id: item.article_id,
            title: item.title,
            summary: item.description || item.content?.slice(0, 200) || 'No summary available.',
            source: item.source_id || 'Unknown Source',
            category: category || 'General',
            date: new Date(item.pubDate).toLocaleDateString(),
            url: item.link,
            thumbnail: item.image_url,
            timestamp: new Date(item.pubDate).getTime()
        }))

        return NextResponse.json(items)
    } catch (err: any) {
        console.error('Chronicles API Route Error:', err)
        return NextResponse.json({ error: 'FETCH_FAILED', details: err.message }, { status: 500 })
    }
}
