/* =====================================================================
   APPLICATION — the compare action
   Reads like a recipe: split the query, look the names up, check the
   guardrails, then hand back a result. It knows nothing about the page,
   so the same checks work in a test with no browser open.
   ===================================================================== */
window.WSTApp = window.WSTApp || {};

(function (App) {
    'use strict';

    const GOALS = {
        needTwo: 'needTwo',
        unknown: 'unknown',
        mixedKinds: 'mixedKinds',
        ok: 'ok'
    };

    function createCompare(source) {
        function run(queryStr, category) {
            const D = window.WSTDomain;
            const names = D.parsePromptEntities(queryStr);

            if (names.length < 2) {
                const first = names[0] || 'Jollibee';
                const proto = source.getProfiles([first], category)[0];
                return {
                    kind: GOALS.needTwo,
                    first,
                    rival: proto.peer || 'McDo',
                    max: D.MAX_COMPARE
                };
            }

            const profiles = source.getProfiles(names, category);

            const unknown = profiles.filter(p => p.unknown);
            if (unknown.length) {
                return {
                    kind: GOALS.unknown,
                    unknown,
                    suggestions: source.getMatchupSuggestions(category).slice(0, 3),
                    max: D.MAX_COMPARE
                };
            }

            const types = new Set(profiles.map(p => p.type));
            if (types.size > 1) {
                const brandItem = profiles.find(p => p.type === 'brand');
                const prodItem = profiles.find(p => p.type === 'product');
                return {
                    kind: GOALS.mixedKinds,
                    brandItem,
                    prodItem,
                    brandPeer: prodItem.parentBrand || brandItem.peer || 'Samsung',
                    skuPeer: brandItem.skuSample || 'iPhone 16 Pro'
                };
            }

            return {
                kind: GOALS.ok,
                profiles,
                query: profiles.map(p => p.name).join(' vs ')
            };
        }

        return { run };
    }

    App.GOALS = GOALS;
    App.createCompare = createCompare;
})(window.WSTApp);
