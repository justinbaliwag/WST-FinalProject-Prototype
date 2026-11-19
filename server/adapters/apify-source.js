/* ====================================================================
   LIVE TIKTOK SOURCE (Apify adapter)
   --------------------------------------------------------------------
   Only used when DATA_SOURCE=live and an APIFY_TOKEN exists. It asks
   Apify for a few TikTok posts and hands back plain objects - the same
   shape the sample source gives - so nothing downstream changes.
   ==================================================================== */

const ENDPOINT = 'https://api.apify.com/v2/acts/clockworks~free-tiktok-scraper/run-sync-get-dataset-items';

async function fetchRawPosts(query, settings) {
    const url = `${ENDPOINT}?token=${encodeURIComponent(settings.apifyToken)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), settings.searchTimeoutMs);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ searchQueries: [query], resultsPerPage: settings.liveLimit }),
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`Apify failed with status ${response.status}`);
        }

        const items = await response.json();
        return (items || []).slice(0, settings.liveLimit).map(item => ({
            id: String(item.id || ''),
            text: item.text || item.desc || 'Untitled TikTok video',
            author: item.authorMeta && item.authorMeta.name ? item.authorMeta.name : 'TikTok Creator',
            likes: Number(item.diggCount || item.likes || item.playCount || 0),
            comments: Number(item.commentCount || 0),
            url: item.webVideoUrl || '',
            platform: 'tiktok',
            source: 'live'
        }));
    } finally {
        clearTimeout(timer);
    }
}

module.exports = { fetchRawPosts };
