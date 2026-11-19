/* =====================================================================
   DOMAIN — the short answer (pure, no page, no network)
   Turns profiles into: ranked shares, one sentence, three highlights.
   Numbers only — the page decides how to draw them.
   ===================================================================== */
window.WSTDomain = window.WSTDomain || {};

(function (D) {
    'use strict';

    /* Shares of the talk, biggest first. */
    function rankShares(profiles) {
        const list = profiles || [];
        const total = list.reduce((s, e) => s + e.mentions, 0) || 1;
        const shares = list.map(e => ({ e, pct: Math.round(e.mentions / total * 100) }));
        return { total, ranked: shares.slice().sort((a, b) => b.pct - a.pct) };
    }

    /* "Jollibee and McDo and KFC" reads badly, so cap the spoken list. */
    function nameTheRest(arr) {
        return arr.length <= 2
            ? arr.join(' and ')
            : `${arr[0]} and ${arr.length - 1} others`;
    }

    function verdictSentence(ranked) {
        const win = ranked[0].e;
        const runnerUp = ranked[1];
        const gap = ranked[0].pct - runnerUp.pct;
        const others = ranked.slice(1).map(r => r.e.name);

        if (gap <= 2 && ranked.length >= 3) {
            return `${nameTheRest(ranked.map(r => r.e.name))} are neck and neck`;
        }
        if (gap <= 2) {
            return `${win.name} and ${runnerUp.e.name} are neck and neck`;
        }
        if (ranked.length >= 3) {
            return `${win.name} is ${gap >= 15 ? 'well ahead of ' : 'ahead of '}${nameTheRest(others)}`;
        }
        return `${win.name} is ${gap >= 15 ? 'well ahead of ' : 'ahead of '}${runnerUp.e.name}`;
    }

    /* The three one-line reasons behind the sentence. */
    function highlightPoints(profiles) {
        const list = profiles || [];
        if (!list.length) return [];
        const bestS = list.slice().sort((a, b) => b.sentiment - a.sentiment)[0];
        const bestV = list.slice().sort((a, b) => b.velocity - a.velocity)[0];
        const bestC = list.slice().sort((a, b) => b.commentRatio - a.commentRatio)[0];
        return [
            ['How people feel', `${bestS.name} gets the friendliest talk (${bestS.sentiment >= 0 ? '+' : ''}${bestS.sentiment}% more positive than negative).`],
            ['How fast it grows', `${bestV.name} is growing fastest today (${bestV.velocity >= 100 ? '+' : ''}${bestV.velocity}% in 24 hours).`],
            ['Who replies most', `${bestC.name} has the liveliest comment section (${bestC.commentRatio}/100 replies per like).`]
        ];
    }

    /* Everything the short answer needs, in one call. */
    function summarise(profiles) {
        const { total, ranked } = rankShares(profiles);
        return {
            total,
            ranked,
            sentence: verdictSentence(ranked),
            points: highlightPoints(profiles)
        };
    }

    D.rankShares = rankShares;
    D.verdictSentence = verdictSentence;
    D.highlightPoints = highlightPoints;
    D.summarise = summarise;
})(window.WSTDomain);
