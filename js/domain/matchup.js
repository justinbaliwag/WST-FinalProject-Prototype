/* =====================================================================
   DOMAIN — matchup rules (pure, no browser, no network)
   Given names + a list of known entities, it says what the query means.
   It never touches the page and never invents numbers.
   ===================================================================== */
window.WSTDomain = window.WSTDomain || {};

(function (D) {
    'use strict';

    const MAX_COMPARE = 5; // how many entities can be compared at once

    /* "Jollibee vs McDo and KFC" -> ['Jollibee','McDo','KFC'] */
    function parsePromptEntities(q, max = MAX_COMPARE) {
        return String(q || '')
            .replace(/^(compare|benchmark|analyze)\s+/i, '')
            .split(/\s+(?:vs\.?|versus|and)\s+|\s*,\s*|\s*&\s*/i)
            .map(x => x.replace(/\b(vs|versus|and)\b/gi, ' ').replace(/[&,]/g, ' ').replace(/\s+/g, ' ').trim())
            .filter(x => x && !/^(vs|versus|and|&|,)$/i.test(x))
            .slice(0, max);
    }

    /* Case-insensitive lookup in the known entity map.
       A name that is not in the map comes back marked unknown —
       never filled with made-up numbers. */
    function resolveEntity(rawName, knownEntities, category) {
        const clean = String(rawName || '').trim();
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
