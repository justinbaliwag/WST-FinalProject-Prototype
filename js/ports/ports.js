/* =====================================================================
   PORTS — the shape every data source must fit
   A port is just a written promise about what a plug must answer.
   Nothing here runs; it only names the methods and keeps them in one place.
   ===================================================================== */
window.WSTPorts = window.WSTPorts || {};

(function (P) {
    'use strict';

    /* ContentSource: getProfiles(), getMatchupSuggestions(category), getPulsePosts()
       AccountGateway: session(), signIn(), signOut()
       ExplainerGateway: explain(payload)
       SourceInfo: info()  -> { sample: true|false } */
    function assertPort(name, obj, methods) {
        const missing = methods.filter(m => typeof obj[m] !== 'function');
        if (missing.length) {
            throw new Error(`${name} is missing: ${missing.join(', ')}`);
        }
        return obj;
    }

    P.assertPort = assertPort;
})(window.WSTPorts);
