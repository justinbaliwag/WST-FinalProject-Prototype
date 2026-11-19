/* ====================================================================
   EXPLAIN ACTION (retrieval + chart choice + plain answer)
   --------------------------------------------------------------------
   This is the rule-based stand-in for RAG. It does the three real parts:
     1. RETRIEVE - read back the saved posts that match the question
     2. CHOOSE A CHART - pick the shape that fits the data it found
     3. WRITE THE ANSWER - one plain-English paragraph that only uses
        the same numbers the chart shows, so nothing is invented.
   No language model is called: the wording is written by rules, which
   means it works offline, costs nothing, and says the same thing every
   time you ask it the same question.
   ==================================================================== */

const store = require('../store/post-store');

/* Measured fields a match-up can be explained with. */
const METRICS = {
    mentions: { label: 'how much people talk', unit: 'posts' },
    sentiment: { label: 'how positive the talk is', unit: '% net positive' },
    velocity: { label: 'how fast it is growing', unit: 'points in 24h' },
    commentRatio: { label: 'how lively the comments are', unit: 'replies per 100 likes' }
};

/**
 * Step 2 - the chart picker. Rules, not AI:
 * a 2-entity share story reads best as a donut, a 3+ entity one as bars,
 * a single trend as a line, and "how does X feel" as a sentiment split.
 */
function chooseChart(data) {
    if (!data || !data.entities || !data.entities.length) return 'none';
    if (data.entities.length === 2) return 'donut';
    if (data.entities.length >= 3) return 'bars';
    return 'split';
}

function safeFind(query) {
    try {
        return store.findPosts(query, 20);
    } catch (_) {
        return [];
    }
}

/**
 * Step 1 - retrieval. Pull the saved posts for the entities in the
 * question and count how many each one actually shows up in.
 */
function retrieve(query, entities) {
    const posts = safeFind(query);
    const names = (entities || []).map(e => String(e.name || e).toLowerCase());

    const hits = names.map(name => ({
        name,
        mentions: posts.filter(p => (p.caption || '').toLowerCase().includes(name)).length
    }));

    return { posts, hits };
}

/**
 * The whole explain action: given already-computed profiles, return a
 * plain answer plus the chart the page should draw to back it up.
 */
function explain(query, profiles) {
    const entities = (profiles || []).map(p => ({
        name: p.name,
        mentions: Number(p.mentions || 0),
        sentiment: Number(p.sentiment || 0),
        velocity: Number(p.velocity || 0),
        commentRatio: Number(p.commentRatio || 0)
    }));

    if (entities.length < 2) {
        return {
            ok: false,
            reason: 'Need at least two entities to explain a comparison.',
            chart: 'none'
        };
    }

    const retrieved = retrieve(query, entities);
    const chart = chooseChart({ entities });

    const total = entities.reduce((s, e) => s + e.mentions, 0) || 1;
    const ranked = [...entities].sort((a, b) => b.mentions - a.mentions);
    const winner = ranked[0];
    const runnerUp = ranked[1];
    const sharePct = Math.round((winner.mentions / total) * 100);
    const gap = sharePct - Math.round((runnerUp.mentions / total) * 100);

    const friendliest = [...entities].sort((a, b) => b.sentiment - a.sentiment)[0];
    const fastest = [...entities].sort((a, b) => b.velocity - a.velocity)[0];
    const chattiest = [...entities].sort((a, b) => b.commentRatio - a.commentRatio)[0];

    const lead = gap <= 2 ? 'are neck and neck' : `puts ${winner.name} ahead of ${runnerUp.name}`;

    /* Name every entity's share, not just the top two, so a 3-5 way
       comparison never reads as if the rest were not compared. */
    const shareList = ranked
        .map(e => `${e.name} ${Math.round((e.mentions / total) * 100)}%`)
        .join(', ');

    const sentences = [
        `Share of the talk: ${shareList}.`,
        `${winner.name} takes ${sharePct}% of the talk, which ${lead}${gap <= 2 ? ' with ' + runnerUp.name : ''}.`,
        `${friendliest.name} has the ${METRICS.sentiment.label}: ${friendliest.sentiment}% ${METRICS.sentiment.unit}.`,
        `${fastest.name} is ${METRICS.velocity.label} fastest: ${fastest.velocity} ${METRICS.velocity.unit}.`,
        `${chattiest.name} has the liveliest comments: ${chattiest.commentRatio} ${METRICS.commentRatio.unit}.`,
        `Backed by ${retrieved.posts.length} saved ${retrieved.posts.length === 1 ? 'post' : 'posts'} from the local store.`
    ];

    return {
        ok: true,
        chart,
        answer: sentences.join(' '),
        paragraphs: sentences,
        evidence: retrieved.posts.slice(0, 3).map(p => ({
            author: p.author,
            caption: p.caption,
            url: p.url
        })),
        chartData: {
            entities: entities.map(e => ({
                name: e.name,
                share: Math.round((e.mentions / total) * 100),
                sentiment: e.sentiment,
                velocity: e.velocity,
                commentRatio: e.commentRatio
            }))
        },
        method: 'rules-v1',
        note: 'Written by fixed rules from the same numbers the chart uses. No language model was called.'
    };
}

module.exports = { explain, chooseChart, retrieve, METRICS };
