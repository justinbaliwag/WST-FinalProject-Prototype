/* ====================================================================
   HTTP EDGE (driving adapter)
   --------------------------------------------------------------------
   Translates web requests into calls on the use cases and back again.
   It is deliberately thin: parse, validate, delegate, reply. No TikTok
   URLs, no file paths and no business rules live here.
   ==================================================================== */

const express = require('express');

const settings = require('../config/settings');
const searchPosts = require('../use-cases/search-posts');
const explainDecision = require('../use-cases/explain-decision');
const store = require('../store/post-store');

/* Very small in-memory rate limit so a demo cannot hammer the paid API. */
function rateLimiter({ windowMs, max }) {
    const hits = new Map();
    return (req, res, next) => {
        const key = req.ip || 'unknown';
        const now = Date.now();
        const entry = hits.get(key) || { count: 0, start: now };
        if (now - entry.start > windowMs) {
            entry.count = 0;
            entry.start = now;
        }
        entry.count += 1;
        hits.set(key, entry);
        if (entry.count > max) {
            return res.status(429).json({
                success: false,
                error: 'Too many searches. Wait a minute and try again.'
            });
        }
        next();
    };
}

function createRoutes(authRouter) {
    const router = express.Router();
    const limiter = rateLimiter(settings.rateLimit);

    // Local accounts: sign up / sign in / guest. Everything stays on this machine.
    router.use('/auth', authRouter);

    router.get('/source', (req, res) => {
        res.json({
            success: true,
            source: settings.source,
            sample: settings.source === 'sample',
            note: settings.source === 'sample'
                ? 'Sample data: illustrative only, not measured numbers.'
                : 'Live data from TikTok through Apify.'
        });
    });

    router.post('/search', limiter, async (req, res) => {
        const { query } = req.body || {};
        if (!query || !String(query).trim()) {
            return res.status(400).json({ success: false, error: 'Query is required.' });
        }

        try {
            const result = await searchPosts.searchPosts(String(query).trim(), settings);
            res.json({ success: true, ...result });
        } catch (err) {
            console.error('Search failed:', err.message);
            res.status(502).json({
                success: false,
                error: settings.source === 'live'
                    ? 'The live TikTok source failed. Check your token and try again.'
                    : 'The sample source failed. Run the server from the project folder.'
            });
        }
    });

    router.get('/posts', (req, res) => {
        const posts = store.findPosts(String(req.query.q || ''), Number(req.query.limit) || 20);
        res.json({ success: true, count: posts.length, data: posts });
    });

    router.get('/store/stats', (req, res) => {
        res.json({ success: true, ...store.stats() });
    });

    router.post('/explain', (req, res) => {
        const { query, profiles } = req.body || {};
        const result = explainDecision.explain(String(query || ''), profiles);
        res.status(result.ok ? 200 : 400).json(result);
    });

    return router;
}

module.exports = { createRoutes };
