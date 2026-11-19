/* =====================================================================
   ADAPTER — saved posts (the retrieval half of the explainer)
   Asks the server's local store which saved posts match the query.
   ===================================================================== */
window.WSTAdapters = window.WSTAdapters || {};

(function (A) {
    'use strict';

    function createPostGateway() {
        return {
            async findPosts(query, limit) {
                const url = `/api/posts?q=${encodeURIComponent(String(query || ''))}&limit=${Number(limit) || 20}`;
                const res = await fetch(url);
                const data = await res.json();
                return (data && data.data) || [];
            }
        };
    }

    A.createPostGateway = createPostGateway;
})(window.WSTAdapters);
