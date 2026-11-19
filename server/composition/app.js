/* ====================================================================
   APP WIRING (composition root)
   --------------------------------------------------------------------
   The only file that knows every piece: it picks the real auth router
   and the HTTP edge, then serves the page. Everything else stays
   unaware of Express.
   ==================================================================== */

const express = require('express');
const cors = require('cors');
const path = require('path');

const settings = require('../config/settings');
const auth = require('../auth');
const routes = require('../edge/routes');

function createApp() {
    const app = express();
    app.use(cors({ origin: true, credentials: true }));
    app.use(express.json({ limit: '256kb' }));

    app.use('/api', routes.createRoutes(auth.router));

    // Serve the app itself so the login cookie works (file:// pages cannot keep one)
    const ROOT_DIR = path.join(__dirname, '..', '..');
    app.use(express.static(ROOT_DIR, { extensions: ['html'] }));

    return app;
}

module.exports = { createApp, settings };
