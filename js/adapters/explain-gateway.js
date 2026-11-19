/* =====================================================================
   ADAPTER — the explainer plug
   It only does I/O: send the profiles to the server's explain action and
   hand back the reply. No wording, no chart choice, no maths here.
   ===================================================================== */
window.WSTAdapters = window.WSTAdapters || {};

(function (A) {
    'use strict';

    function createExplainGateway() {
        return {
            /* Resolves to the server's reply, or rejects on a network problem. */
            async explain(payload) {
                const res = await fetch('/api/explain', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                return res.json();
            }
        };
    }

    A.createExplainGateway = createExplainGateway;
})(window.WSTAdapters);
