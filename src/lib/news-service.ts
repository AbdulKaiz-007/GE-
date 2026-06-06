
export interface NewsItem {
    id: string;
    title: string;
    summary?: string;
    source: string;
    category: string;
    date: string;
    url: string;
    thumbnail?: string;
    timestamp: number;
}

export async function fetchAllNews(category?: string, query?: string): Promise<NewsItem[]> {
    try {
        const params = new URLSearchParams();
        if (category && category !== 'All Scrolls') params.append('category', category);
        if (query) params.append('q', query);

        const response = await fetch(`/api/news?${params.toString()}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'NEWS_FETCH_ERROR');
        }

        return await response.json();
    } catch (error) {
        console.error("Global news fetch error:", error);
        return [];
    }
}

