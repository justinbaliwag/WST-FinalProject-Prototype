/* =====================================================================
   COMPOSITION — the only file that decides which plugs are used
   Want real TikTok data instead of sample data? Change one line here.
   Nothing else in the app knows where the numbers come from.
   ===================================================================== */
window.WST = window.WST || {};

(function (W) {
    'use strict';

    const sample = window.WSTAdapters.createSampleSource(window.DemoData);

    /* The chosen content source. Today: sample data.
       A real adapter would sit here later and answer the same questions. */
    const source = window.WSTPorts.assertPort('ContentSource', sample, [
        'getProfiles', 'getMatchupSuggestions', 'getPulsePosts'
    ]);

    /* The explainer's two plugs: the server's rule action, and the local
       store of cleaned posts used as its evidence. */
    const explainGateway = window.WSTPorts.assertPort('ExplainerGateway',
        window.WSTAdapters.createExplainGateway(), ['explain']);
    const postGateway = window.WSTPorts.assertPort('PostGateway',
        window.WSTAdapters.createPostGateway(), ['findPosts']);

    const compare = window.WSTApp.createCompare(source);
    const explain = window.WSTApp.createExplain(explainGateway, postGateway);

    W.source = source;
    W.compare = compare;
    W.explain = explain;
    W.domain = window.WSTDomain;
})(window.WST);
