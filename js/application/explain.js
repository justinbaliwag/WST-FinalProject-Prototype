/* =====================================================================
   APPLICATION — the explain action
   Order of work:
     1. ask the server's explain action (it reads the local store)
     2. if that fails, write the answer locally with the same rules
   Either way the chart choice and the wording come from domain/explainer.js
   through the server, so the page never invents a number of its own.
   ===================================================================== */
window.WSTApp = window.WSTApp || {};

(function (App) {
    'use strict';

    function createExplain(explainGateway, postGateway) {
        function payloadFor(profiles, query) {
            return {
                query: String(query || ''),
                profiles: (profiles || []).map(p => ({
                    name: p.name,
                    mentions: p.mentions,
                    sentiment: p.sentiment,
                    velocity: p.velocity,
                    commentRatio: p.commentRatio
                }))
            };
        }

        async function run(profiles, query) {
            const D = window.WSTDomain;
            if (!profiles || profiles.length < 2) {
                return { ok: false, reason: 'Need at least two entities to explain a comparison.' };
            }

            try {
                const data = await explainGateway.explain(payloadFor(profiles, query));
                if (data && data.ok) {
                    return {
                        ok: true,
                        source: 'server',
                        answer: data.answer,
                        summary: data.summary || data.answer,
                        chart: data.chart,
                        note: data.note,
                        evidence: data.evidence || []
                    };
                }
            } catch (_) {
                /* server unreachable - fall through to the local rules */
            }

            /* Fallback: same rules, no server. Marked clearly as offline. */
            let retrieved = [];
            try {
                retrieved = await postGateway.findPosts(query, 20);
            } catch (_) {
                retrieved = [];
            }

            const local = D.buildAnswer(profiles, retrieved.length);
            return {
                ok: true,
                source: 'offline',
                answer: local.answer,
                summary: local.summary,
                chart: local.chart,
                note: 'Written by fixed rules on this page (the server was not reachable). No language model was called.',
                evidence: retrieved.slice(0, 3).map(p => ({ author: p.author, caption: p.caption, url: p.url }))
            };
        }

        return { run, chooseChart: window.WSTDomain.chooseChart };
    }

    App.createExplain = createExplain;
})(window.WSTApp);
