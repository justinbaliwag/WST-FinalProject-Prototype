/* ====================================================================
   APP WIRING (composition root)
   --------------------------------------------------------------------
   The only file that knows every piece: it picks the real auth router
   and the HTTP edge, then serves the page. Everything else stays
   unaware of Express.
   ==================================================================== */

const express = require('express');
const path = require('path');

const settings = require('../config/settings');
const auth = require('../auth');
const routes = require('../edge/routes');

function createApp() {
    const app = express();
    /* No CORS on purpose: the page is served from this same address, so no
       other website can read these answers with the login cookie attached. */
    app.use(express.json({ limit: '256kb' }));

    /* Safety headers on every answer: the page may only load itself and the
       things it needs, cannot be framed by another site, and browsers stop
       guessing what a file is. */
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('Referrer-Policy', 'same-origin');
        res.setHeader('Content-Security-Policy', [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data:",
            "connect-src 'self'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'"
        ].join('; '));
        next();
    });

    app.use('/api', routes.createRoutes(auth.router));

    // Serve the app itself so the login cookie works (file:// pages cannot keep one).
    // Only the folders the page needs are public: server code, node_modules,
    // docs and the saved posts stay private.
    const ROOT_DIR = path.join(__dirname, '..', '..');
    app.get('/', (req, res) => res.sendFile(path.join(ROOT_DIR, 'index.html')));
    app.get('/index.html', (req, res) => res.sendFile(path.join(ROOT_DIR, 'index.html')));
    app.use('/css', express.static(path.join(ROOT_DIR, 'css')));
    app.use('/js', express.static(path.join(ROOT_DIR, 'js')));
    app.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        res.status(404).type('text').send('Not found');
    });

    return app;
}

module.exports = { createApp, settings };
