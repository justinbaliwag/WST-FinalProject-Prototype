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

    /* One short line: who leads, and by how much. Nothing else. */
    function oneLineSummary(profiles, ranked) {
        const win = ranked[0].e;
        const second = ranked[1];
        const gap = ranked[0].pct - second.pct;
        if (gap <= 2) {
            return `${win.name} and ${second.e.name} are neck and neck on the talk.`;
        }
        const others = ranked.length > 2
            ? ` Other names compared: ${ranked.slice(2).map(r => `${r.e.name} ${r.pct}%`).join(', ')}.`
            : '';
        return `${win.name} leads on the talk with ${ranked[0].pct}% against ${second.pct}% for ${second.e.name}.${others}`;
    }

    /* Which name is ahead in which area, in one short line.
       Areas use plain words so a beginner knows what they mean. */
    const AREAS = [
        ['sentiment', 'friendlier talk'],
        ['velocity', 'faster growth'],
        ['commentRatio', 'livelier comments']
    ];

    function leadersOf(list, key) {
        const sorted = list.slice().sort((a, b) => (b[key] || 0) - (a[key] || 0));
        return { top: sorted[0], next: sorted[1] };
    }

    function whereLeads(profiles) {
        const list = profiles || [];
        if (list.length < 2) return '';

        const { top, next } = leadersOf(list, 'sentiment');
        const leads = AREAS.map(([key]) => leadersOf(list, key).top.name);
        const sameName = leads.every(n => n === leads[0]);

        if (sameName) {
            const names = AREAS.map(([, area]) => area);
            const joined = names.length > 1
                ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
                : names[0];
            return `${leads[0]} also leads on ${joined}.`;
        }

        const tied = (top['sentiment'] || 0) === (next && (next['sentiment'] || 0));

        /* Group the areas by who leads them, so one name is said once:
           "McDo leads on friendlier talk, KFC on faster growth and livelier comments." */
        const groups = [];
        const ties = [];
        AREAS.forEach(([key, area]) => {
            const { top: who, next: runner } = leadersOf(list, key);
            if (runner && (who[key] || 0) === (runner[key] || 0)) {
                ties.push(`${who.name} and ${runner.name} level on ${area}`);
                return;
            }
            const last = groups[groups.length - 1];
            if (last && last.who === who.name) {
                last.areas.push(area);
            } else {
                groups.push({ who: who.name, areas: [area] });
            }
        });

        /* "a, b and c" from a plain list. */
        function say(parts) {
            if (!parts.length) return '';
            return parts.length > 1
                ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
                : parts[0];
        }

        const clauses = groups.map((g, i) => {
            const areas = say(g.areas);
            return i === 0 ? `${g.who} leads on ${areas}` : `${g.who} on ${areas}`;
        });
        if (ties.length) clauses.push(...ties);
        if (!clauses.length) return '';

        return `${clauses.join(', ')}.`;
    }

    /* Everything the short answer needs, in one call. */
    function summarise(profiles) {
        const { total, ranked } = rankShares(profiles);
        return {
            total,
            ranked,
            sentence: verdictSentence(ranked),
            summary: ranked.length >= 2 ? oneLineSummary(profiles, ranked) : '',
            where: whereLeads(profiles),
            points: highlightPoints(profiles)
        };
    }

    D.rankShares = rankShares;
    D.verdictSentence = verdictSentence;
    D.highlightPoints = highlightPoints;
    D.oneLineSummary = oneLineSummary;
    D.whereLeads = whereLeads;
    D.summarise = summarise;
})(window.WSTDomain);
