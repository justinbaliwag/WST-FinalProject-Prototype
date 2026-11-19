/* ====================================================================
   SEARCH ACTION (the core of the search hexagon)
   --------------------------------------------------------------------
   Order of work: ask the chosen source for raw posts, run them through
   the cleaning pipeline, save only the clean ones to the local store,
   then answer with what survived plus an honest tally of what died.
   ==================================================================== */

const sample = require('../adapters/sample-source');
const live = require('../adapters/apify-source');
const pipeline = require('../cleaning/pipeline');
const store = require('../store/post-store');

function pickSource(settings) {
    return settings.source === 'live' && settings.apifyToken ? live : sample;
}

async function searchPosts(query, settings) {
    const source = pickSource(settings);
    const raw = await source.fetchRawPosts(query, settings);
    const cleaned = pipeline.runPipeline(raw, query);

    const saved = store.savePosts(
        cleaned.kept.map(p => ({
            ...p,
            fingerprint: pipeline.fingerprint({ caption: p.caption })
        })),
        {
            query,
            source: settings.source,
            droppedCount: cleaned.droppedCount,
            reasons: cleaned.reasons
        }
    );

    return {
        query,
        source: settings.source,
        posts: cleaned.kept.slice(0, settings.sampleLimit),
        kept: cleaned.kept.length,
        dropped: cleaned.droppedCount,
        reasons: cleaned.reasons,
        saved,
        summary: buildSummary(query, cleaned, saved, settings.source)
    };
}

function buildSummary(query, cleaned, saved, sourceName) {
    const totalLikes = cleaned.kept.reduce((sum, p) => sum + (p.likes || 0), 0);
    const lead = cleaned.kept[0] ? cleaned.kept[0].author : 'nobody';
    return `Found ${cleaned.kept.length} usable posts about "${query}" (${sourceName} data). ` +
        `Thrown out: ${cleaned.reasons.spam} spam, ${cleaned.reasons.duplicates} reposts, ` +
        `${cleaned.reasons.outOfScope} off-topic. ` +
        `Total engagement ${totalLikes.toLocaleString()} interactions. Leading account: ${lead}. ` +
        `Saved ${saved.added} new posts to the local store (${saved.total} total).`;
}

module.exports = { searchPosts };
