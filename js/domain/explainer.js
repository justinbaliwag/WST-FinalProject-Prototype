/* =====================================================================
   DOMAIN — the explainer (pure, no page, no network)
   Two jobs, both just rules:
     1. pick the chart shape that fits the data
     2. write the plain answer from the very same numbers the chart uses
   Nothing here fetches anything. The rows arrive as a list.
   ===================================================================== */
window.WSTDomain = window.WSTDomain || {};

(function (D) {
    'use strict';

    const METRICS = {
        mentions: { label: 'how much people talk', unit: 'posts' },
        sentiment: { label: 'how positive the talk is', unit: '% net positive' },
        velocity: { label: 'how fast it is growing', unit: 'points in 24h' },
        commentRatio: { label: 'how lively the comments are', unit: 'replies per 100 likes' }
    };

    /* Which chart fits? Two entities read best as one split bar, three or
       more need a bar each, and a single entity is a sentiment split. */
    function chooseChart(entityCount) {
        const n = Number(entityCount) || 0;
        if (n < 1) return 'none';
        if (n === 2) return 'donut';
        if (n >= 3) return 'bars';
        return 'split';
    }

    /* One plain paragraph, built only from the numbers handed in. */
    function buildAnswer(profiles, retrievedCount) {
        const list = (profiles || []).map(p => ({
            name: p.name,
            mentions: Number(p.mentions || 0),
            sentiment: Number(p.sentiment || 0),
            velocity: Number(p.velocity || 0),
            commentRatio: Number(p.commentRatio || 0)
        }));

        if (list.length < 2) {
            return { sentences: [], answer: '', chart: 'none', ranked: [] };
        }

        const { total, ranked } = D.rankShares(list);
        const winner = ranked[0].e;
        const runnerUp = ranked[1].e;
        const sharePct = ranked[0].pct;
        const gap = sharePct - ranked[1].pct;

        const friendliest = list.slice().sort((a, b) => b.sentiment - a.sentiment)[0];
        const fastest = list.slice().sort((a, b) => b.velocity - a.velocity)[0];
        const chattiest = list.slice().sort((a, b) => b.commentRatio - a.commentRatio)[0];

        const lead = gap <= 2
            ? `puts ${winner.name} level with ${runnerUp.name}`
            : `puts ${winner.name} ahead of ${runnerUp.name}`;

        const shareList = ranked
            .map(r => `${r.e.name} ${r.pct}%`)
            .join(', ');

        const sentences = [
            `Share of the talk: ${shareList}.`,
            `${winner.name} takes ${sharePct}% of the talk, which ${lead}.`,
            `${friendliest.name} has the friendliest talk: ${friendliest.sentiment >= 0 ? '+' : ''}${friendliest.sentiment}% net positive.`,
            `${fastest.name} is growing fastest: ${fastest.velocity >= 100 ? '+' : ''}${fastest.velocity}% in 24 hours.`,
            `${chattiest.name} has the liveliest comments: ${chattiest.commentRatio} replies per 100 likes.`
        ];

        if (typeof retrievedCount === 'number') {
            sentences.push(
                `Backed by ${retrievedCount} saved ${retrievedCount === 1 ? 'post' : 'posts'} from the local store.`
            );
        }

        return {
            sentences,
            answer: sentences.join(' '),
            chart: chooseChart(list.length),
            ranked,
            chartData: {
                entities: list.map(e => ({
                    name: e.name,
                    share: Math.round((e.mentions / total) * 100),
                    sentiment: e.sentiment,
                    velocity: e.velocity,
                    commentRatio: e.commentRatio
                }))
            }
        };
    }

    D.METRICS = METRICS;
    D.chooseChart = chooseChart;
    D.buildAnswer = buildAnswer;
})(window.WSTDomain);
