/* =====================================================================
   ADAPTER — sample data
   The plug that answers from js/data/demo-data.js.
   Swap this plug file for a real TikTok one and the rules never change.
   ===================================================================== */
window.WSTAdapters = window.WSTAdapters || {};

(function (A) {
    'use strict';

    function createSampleSource(data) {
        const source = data || {};
        const entities = source.entities || {};
        const matchups = source.matchups || { brand: [], product: [] };
        const posts = source.posts || [];

        return {
            getProfiles(rawNames, category) {
                const resolve = window.WSTDomain.resolveEntity;
                return rawNames.map(n => resolve(n, entities, category));
            },
            getKnownEntities() {
                return entities;
            },
            getMatchupSuggestions(category) {
                return matchups[category] || [];
            },
            getPulsePosts() {
                return posts;
            }
        };
    }

    A.createSampleSource = createSampleSource;
})(window.WSTAdapters);
