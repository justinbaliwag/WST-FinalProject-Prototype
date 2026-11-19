/* ====================================================================
   ENTRY POINT - starts the app
   --------------------------------------------------------------------
   All wiring lives in server/composition/app.js; this file only listens.
   Layout now follows a hexagonal shape:

     server/edge/          what the outside world talks to (HTTP routes)
     server/use-cases/     what the app actually does (search, explain)
     server/cleaning/      the rules that judge incoming posts
     server/store/         where cleaned posts are kept
     server/adapters/      the outside sources (sample data, TikTok)
     server/config/        the one settings file
     server/composition/   the single place that joins it all together
   ==================================================================== */

const { createApp, settings } = require('./composition/app');

const app = createApp();

app.listen(settings.port, () => {
    console.log(`Server running at http://localhost:${settings.port}`);
    console.log(`Data source: ${settings.source}${settings.source === 'sample' ? ' (sample posts, no token needed)' : ' (live TikTok via Apify)'}`);
});
