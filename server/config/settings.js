/* ====================================================================
   SETTINGS - the one place that chooses where data comes from
   --------------------------------------------------------------------
   The rest of the app never reads process.env directly. To point the
   demo at real TikTok instead of the built-in sample, change ONE value
   here (or set DATA_SOURCE=sample|live in your .env file).
   ==================================================================== */

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const requested = (process.env.DATA_SOURCE || '').trim().toLowerCase();
const hasToken = Boolean(process.env.APIFY_TOKEN && process.env.APIFY_TOKEN.trim());
/* 'live' only when explicitly asked for AND a token exists. */
const source = requested === 'live' && hasToken ? 'live' : 'sample';

/* Google sign-in reads its values here too, so auth.js never touches process.env. */
const port = Number(process.env.PORT) || 3000;

module.exports = {
    source,
    apifyToken: source === 'live' ? process.env.APIFY_TOKEN.trim() : null,
    port,
    google: {
        clientId: (process.env.GOOGLE_CLIENT_ID || '').trim(),
        clientSecret: (process.env.GOOGLE_CLIENT_SECRET || '').trim(),
        redirectUri: (process.env.GOOGLE_REDIRECT_URI || `http://localhost:${port}/api/auth/google/callback`).trim()
    },
    sampleLimit: 5,
    liveLimit: 6,
    searchTimeoutMs: 20000,
    rateLimit: { windowMs: 60000, max: 20 }
};
