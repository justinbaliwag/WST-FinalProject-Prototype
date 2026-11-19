/* =====================================================================
   DOMAIN — matchup rules (pure, no browser, no network)
   Given names + a list of known entities, it says what the query means.
   It never touches the page and never invents numbers.
   ===================================================================== */
window.WSTDomain = window.WSTDomain || {};

(function (D) {
    'use strict';

    const MAX_COMPARE = 5; // how many entities can be compared at once

    /* Words that join two names instead of naming one. */
    const CONNECTORS = new Set(['vs', 'versus', 'and']);
    const LEAD_IN = /^(?:compare|benchmark|analyze|analyse)$/i;

    /* "vs." -> "vs", "," -> "" — punctuation never belongs to a name. */
    function bareWord(word) {
        return String(word || '').replace(/[.,;:!?]+/g, '');
    }

    /* "Jollibee vs McDo and and Huawei" -> ['Jollibee','McDo','Huawei']
       Word by word, so a doubled or stray "and" collapses instead of
       becoming a brand of its own. Repeats are dropped: asking for the
       same name twice is one entity, not a duplicate. */
    function parsePromptEntities(q, max = MAX_COMPARE) {
        const words = String(q || '')
            .replace(/[&,\u2013\u2014]/g, ' ')
            .split(/\s+/)
            .filter(Boolean);

        const names = [];
        let current = [];

        const flush = () => {
            const name = current.join(' ').replace(/\s+/g, ' ').trim();
            if (name) names.push(name);
            current = [];
        };

        words.forEach((word, i) => {
            const bare = bareWord(word);
            if (!bare) { flush(); return; }
            if (i === 0 && LEAD_IN.test(bare)) return;
            if (CONNECTORS.has(bare.toLowerCase())) { flush(); return; }
            current.push(bare);
        });
        flush();

        const seen = new Set();
        return names
            .filter(name => !CONNECTORS.has(name.toLowerCase()))
            .filter(name => {
                const key = name.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .slice(0, max);
    }

    /* Case-insensitive lookup in the known entity map.
       A name that is not in the map comes back marked unknown —
       never filled with made-up numbers. */
    function resolveEntity(rawName, knownEntities, category) {
        /* A name is never allowed to keep joining words at its edges,
           however many were typed ("and and Huawei" is just Huawei). */
        const clean = String(rawName || '')
            .replace(/^(?:(?:vs|versus|and)\s+)+/i, '')
            .replace(/(?:\s+(?:vs|versus|and))+$/i, '')
            .replace(/\s+/g, ' ')
            .trim();
        const key = clean.toLowerCase();
        const entities = knownEntities || {};
        if (entities[key]) return Object.assign({}, entities[key]);

        const isSkuPattern = /\b(pro|max|ultra|plus|dn|xm\d|\d+)\b/i.test(clean);
        return {
            name: clean,
            type: isSkuPattern ? 'product' : category,
            unknown: true
        };
    }

    D.MAX_COMPARE = MAX_COMPARE;
    D.parsePromptEntities = parsePromptEntities;
    D.resolveEntity = resolveEntity;
})(window.WSTDomain);
