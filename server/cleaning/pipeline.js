/* ====================================================================
   CLEANING PIPELINE
   --------------------------------------------------------------------
   Raw socmed posts are messy: the same repost appears many times, spam
   bots paste "free GCash" links, and a search for "Apple" drags in the
   fruit. This module runs every incoming post through fixed rules and
   returns only the ones worth keeping, plus the reason each other post
   was thrown away.

   Pure functions only - no network, no files - so it is easy to unit
   test and safe to swap out later for a smarter cleaner.
   ==================================================================== */

const SPAM_PATTERNS = [
    /\bfree\s*(gcash|load|money|cash)\b/i,
    /\bclick\s*(the\s*)?link\s*in\s*(my\s*)?bio\b/i,
    /\bdm\s*(me)?\s*(now|fast)\b/i,
    /\blegit\s*payout\b/i,
    /\b(sign\s*up|register)\s*(now|today)\s*(and|to)\s*(earn|get)\b/i,
    /\b\d+\s*(k|pesos|php)\s*(per|a)\s*(day|hour)\b/i
];

const OFF_TOPIC_HINTS = [
    /\b(recipe|how\s*to\s*cook|childhood|my\s*story)\b/i,
    /\bfruit\s*stand\b/i,
    /\bper\s*kilo\b/i
];

/* Words that say "this post is about the thing being searched". A post also
   counts when the matchup it belongs to is part of the query. */
function mentionsQuery(text, query, matchup) {
    const words = String(query || '')
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 2 && w !== 'vs' && w !== 'versus' && w !== 'and');
    if (!words.length) return true;

    const hay = `${text || ''} ${matchup || ''}`.toLowerCase();
    return words.some(w => hay.includes(w));
}

/* Drop the noise socmed adds so two copies of one post look the same. */
function normalizeText(text) {
    return String(text || '')
        .toLowerCase()
        .replace(/https?:\/\/\S+/g, ' ')
        .replace(/[#@]\w+/g, ' ')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/* Stable fingerprint of a post, used to spot reposts of the same thing. */
function fingerprint(post) {
    const words = normalizeText(post.caption || post.text).split(' ').slice(0, 14);
    return words.join(' ');
}

/* Sample posts carry likes as friendly text: "4.9K" -> 4900. */
function parseCount(value) {
    if (typeof value === 'number') return value;
    const text = String(value || '').trim().toUpperCase().replace(/,/g, '');
    const num = parseFloat(text);
    if (!isFinite(num)) return 0;
    if (text.includes('M')) return Math.round(num * 1000000);
    if (text.includes('K')) return Math.round(num * 1000);
    return Math.round(num);
}

function cleanPost(post, query) {
    if (!post || !(post.caption || post.text)) {
        return { ok: false, reason: 'empty', rule: 'no-text' };
    }
    const text = post.caption || post.text;
    const matchup = post.matchup || '';

    if (SPAM_PATTERNS.some(re => re.test(text))) {
        return { ok: false, reason: 'spam', rule: 'spam-link-or-bait' };
    }
    if (!mentionsQuery(text, query, matchup)) {
        return { ok: false, reason: 'off-topic', rule: 'does-not-mention-query' };
    }
    /* Junk inside the words of the query ("apple" the fruit, a random
       childhood story) is still thrown out, even if it mentions the word. */
    if (OFF_TOPIC_HINTS.some(re => re.test(text))) {
        return { ok: false, reason: 'off-topic', rule: 'out-of-scope' };
    }
    return { ok: true, post };
}

/**
 * Run a raw batch through the pipeline.
 * Returns { kept, dropped, log } where log has one line per rejection.
 */
function runPipeline(rawPosts, query) {
    const kept = [];
    const dropped = [];
    const seen = new Set();

    (rawPosts || []).forEach((post, i) => {
        const verdict = cleanPost(post, query);
        if (!verdict.ok) {
            dropped.push(post);
            return;
        }
        const fp = fingerprint(post);
        if (fp && seen.has(fp)) {
            dropped.push(post);
            return;
        }
        seen.add(fp);

        kept.push({
            id: post.id || `post-${i}`,
            platform: post.plat || post.platform || 'unknown',
            author: post.handle || post.author || 'unknown',
            caption: post.caption || post.text || '',
            title: post.caption || post.text || 'Untitled post',
            likes: parseCount(post.likes || post.score || 0),
            comments: Number(post.comments || 0),
            url: post.url || post.mediaUrl || '',
            matchup: post.matchup || '',
            query: query || '',
            source: post.source || 'unknown'
        });
    });

    return {
        kept,
        droppedCount: dropped.length,
        reasons: summarizeReasons(rawPosts, query, kept, dropped)
    };
}

/* One plain tally of why things were thrown out, for the badge and log. */
function summarizeReasons(rawPosts, query, kept, dropped) {
    const raw = rawPosts || [];
    const tally = { duplicates: 0, spam: 0, outOfScope: 0 };
    const seen = new Set();

    raw.forEach(post => {
        const verdict = cleanPost(post, query);
        if (!verdict.ok) {
            if (verdict.reason === 'spam') tally.spam++;
            else tally.outOfScope++;
            return;
        }
        const fp = fingerprint(post);
        if (fp && seen.has(fp)) { tally.duplicates++; return; }
        seen.add(fp);
    });

    return tally;
}

module.exports = { runPipeline, cleanPost, normalizeText, fingerprint, summarizeReasons };
