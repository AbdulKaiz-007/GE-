
import { BOUNTIES } from './bounty-data';

const ADZUNA_APP_ID = process.env.NEXT_PUBLIC_ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.NEXT_PUBLIC_ADZUNA_APP_KEY;
const BAS_URL = 'https://api.adzuna.com/v1/api/jobs/in/search/1';

export interface Bounty {
    id: string | number;
    title: string;
    company: string;
    location: string;
    type: string;
    source: string;
    posted: string;
    url: string;
    color: string;
    tags: string[];
}

function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
}

export async function fetchAdzunaJobs(query: string = '', location: string = ''): Promise<Bounty[]> {
    if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
        console.warn("Adzuna keys missing, falling back to mock data.");
        return BOUNTIES.filter(job =>
        ((!query ||
            job.title.toLowerCase().includes(query.toLowerCase()) ||
            job.company.toLowerCase().includes(query.toLowerCase()) ||
            job.type.toLowerCase().includes(query.toLowerCase()) ||
            job.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))) &&
            (!location || job.location.toLowerCase().includes(location.toLowerCase())))
        );
    }

    try {
        let url = `${BAS_URL}?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=20&what=${encodeURIComponent(query || 'internship')}`;

        if (location) {
            url += `&where=${encodeURIComponent(location)}`;
        }

        // Smart Filtering
        if (query.toLowerCase().includes('hackathon')) {
            url += '&title_only=hackathon';
        }
        if (query.toLowerCase().includes('internship') || query.toLowerCase().includes('intern')) {
            // Adzuna doesn't map 'internship' perfectly in 'category' always, but we can try specific params if needed.
            // For now, trusting 'what' param.
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Adzuna fetch failed");

        const data = await response.json();
        if (!data.results || data.results.length === 0) return [];

        return data.results.map((job: any) => ({
            id: job.id,
            title: job.title.replace(/<\/?[^>]+(>|$)/g, ""), // Strip HTML tags
            company: job.company.display_name,
            location: job.location.display_name,
            type: job.contract_time === 'full_time' ? 'Full-time' : 'Contract/Internship',
            source: 'Adzuna',
            posted: timeAgo(job.created),
            url: job.redirect_url,
            color: "text-[#0077b5]", // Default Blue
            tags: [job.category.label]
        }));

    } catch (error) {
        console.error("Adzuna API Error:", error);
        // Fallback to mock data on error
        return BOUNTIES.filter(job =>
            !query ||
            job.title.toLowerCase().includes(query.toLowerCase()) ||
            job.company.toLowerCase().includes(query.toLowerCase()) ||
            job.type.toLowerCase().includes(query.toLowerCase()) ||
            job.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
    }
}
