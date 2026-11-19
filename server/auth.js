/* ============================================================================
   Marqueuet — LOCAL AUTH (demo build)
   ----------------------------------------------------------------------------
   Everything here runs on THIS computer only:
     - accounts are stored in Marqueuet/server/.data/users.json
     - passwords are scrambled with scrypt + a random salt (never stored raw)
     - sessions are random tokens in an httpOnly cookie
     - a rate limiter blocks spammers before any account work happens
   No Supabase, no mail service, no internet needed for sign up / sign in.
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dns = require('dns').promises;
const express = require('express');

const DATA_DIR = path.join(__dirname, '.data');   // server/.data
const USERS_FILE = path.join(DATA_DIR, 'users.json');

/* ------------------------------ tiny store ------------------------------- */
function ensureStore() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '{"users":[]}', 'utf8');
}
function readUsers() {
    ensureStore();
    try {
        const raw = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        return Array.isArray(raw.users) ? raw.users : [];
    } catch (_) {
        return [];
    }
}
function writeUsers(users) {
    ensureStore();
    const tmp = USERS_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify({ users }, null, 2), 'utf8');
    fs.renameSync(tmp, USERS_FILE);            // atomic-ish: never a half-written file
}

/* ------------------------------ passwords -------------------------------- */
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}
function verifyPassword(password, stored) {
    if (typeof stored !== 'string' || !stored.includes(':')) return false;
    const [salt, hash] = stored.split(':');
    if (!salt || !hash || hash.length % 2 !== 0) return false;
    try {
        const test = crypto.scryptSync(password, salt, 64).toString('hex');
        if (hash.length !== test.length) return false;
        // constant-time compare so timing cannot leak the password
        return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(test, 'hex'));
    } catch (_) {
        // a damaged stored hash means "cannot verify" - never a server crash
        return false;
    }
}

/* ------------------------------ email rules ------------------------------ */
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
// obvious throwaway / typo-squat domains we never accept
const BAD_DOMAINS = new Set([
    'mailinator.com', 'tempmail.com', 'temp-mail.org', 'guerrillamail.com',
    'sharklasers.com', 'yopmail.com', 'throwawaymail.com', '10minutemail.com',
    'maildrop.cc', 'getnada.com', 'fakeinbox.com', 'trashmail.com',
    'gmail.co', 'gmial.com', 'gmai.com', 'gmail.con', 'yahoo.co', 'hotmial.com'
]);
// domains we know are real, so an offline demo still works without a DNS lookup
const KNOWN_GOOD = new Set([
    'gmail.com', 'googlemail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
    'live.com', 'icloud.com', 'protonmail.com', 'proton.me', 'aol.com',
    'mail.com', 'gmx.com', 'zoho.com', 'up.edu.ph', 'dlsu.edu.ph', 'ust.edu.ph'
]);

function normalizeEmail(v) {
    return String(v || '').trim().toLowerCase();
}

/* Returns { ok, reason } — reason is a short sentence the UI can show. */
async function checkEmail(email) {
    if (!email) return { ok: false, reason: 'Enter your email address.' };
    if (email.length > 254) return { ok: false, reason: 'That email is too long.' };
    if (!EMAIL_RE.test(email)) return { ok: false, reason: 'That does not look like a valid email.' };

    const domain = email.split('@')[1];
    if (BAD_DOMAINS.has(domain)) {
        return { ok: false, reason: 'Please use a real inbox — that domain is blocked.' };
    }
    if (KNOWN_GOOD.has(domain)) return { ok: true, reason: '' };

    // best effort: does this domain actually accept mail? Offline -> allow it.
    try {
        const mx = await withTimeout(dns.resolveMx(domain), 2500);
        if (mx && mx.length) return { ok: true, reason: '' };
        return { ok: false, reason: `The domain ${domain} has no mail server.` };
    } catch (_) {
        return { ok: true, reason: '' };        // cannot tell without network -> do not block
    }
}

function withTimeout(promise, ms) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
    ]);
}

/* ------------------------------ rate limiter ----------------------------- */
/* Sliding window buckets keyed by IP (spam) and by email (guessing).
   All in memory: restarting the server clears it, which is fine for a demo. */
const buckets = new Map();
const RULES = {
    checkEmail: { max: 12, windowMs: 60 * 1000 },
    signup: { max: 5, windowMs: 10 * 60 * 1000 },
    signin: { max: 8, windowMs: 10 * 60 * 1000 },
    google: { max: 10, windowMs: 10 * 60 * 1000 }
};

function rateLimit(kind, key) {
    const rule = RULES[kind] || { max: 10, windowMs: 60 * 1000 };
    const id = `${kind}:${key}`;
    const now = Date.now();
    const hits = (buckets.get(id) || []).filter(t => now - t < rule.windowMs);

    if (hits.length >= rule.max) {
        const retryAfter = Math.ceil((rule.windowMs - (now - hits[0])) / 1000);
        buckets.set(id, hits);
        return { blocked: true, retryAfter, left: 0 };
    }
    hits.push(now);
    buckets.set(id, hits);
    return { blocked: false, retryAfter: 0, left: rule.max - hits.length };
}

// housekeeping so the map cannot grow forever
setInterval(() => {
    const now = Date.now();
    for (const [id, hits] of buckets) {
        const rule = RULES[id.split(':')[0]] || { windowMs: 10 * 60 * 1000 };
        const live = hits.filter(t => now - t < rule.windowMs);
        if (live.length) buckets.set(id, live);
        else buckets.delete(id);
    }
}, 60 * 1000).unref();

/* ------------------------------- sessions -------------------------------- */
const sessions = new Map();                     // token -> { email, name, createdAt }
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;
const COOKIE = 'mq_session';

/* The 'secure' flag means "send this cookie over HTTPS only". On a local
   demo the site runs on http://localhost, where a secure cookie would be
   silently dropped and login would break. So the flag turns on by itself
   once the request arrives over HTTPS (or when COOKIE_SECURE=true is set
   in .env for a site you host behind a proxy). */
function cookieSecure(req) {
    if ((process.env.COOKIE_SECURE || '').trim().toLowerCase() === 'true') return true;
    if (!req) return false;
    if (req.secure) return true;
    const proto = (req.headers['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase();
    return proto === 'https';
}

function readCookie(req, name) {
    const raw = req.headers.cookie || '';
    const found = raw.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
    return found ? decodeURIComponent(found.slice(name.length + 1)) : null;
}

function createSession(req, res, user) {
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, { email: user.email, name: user.name, createdAt: Date.now() });
    res.cookie(COOKIE, token, {
        httpOnly: true,
        secure: cookieSecure(req),
        sameSite: 'lax',
        maxAge: SESSION_TTL,
        path: '/'
    });
    return token;
}

function currentUser(req) {
    const token = readCookie(req, COOKIE);
    if (!token) return null;
    const s = sessions.get(token);
    if (!s) return null;
    if (Date.now() - s.createdAt > SESSION_TTL) { sessions.delete(token); return null; }
    return s;
}

function pruneSessions() {
    const now = Date.now();
    for (const [t, s] of sessions) if (now - s.createdAt > SESSION_TTL) sessions.delete(t);
}
setInterval(pruneSessions, 60 * 60 * 1000).unref();

/* -------------------------------- routes --------------------------------- */
const router = express.Router();

function clientKey(req) {
    /* Only the real connection address: a visitor cannot pick their own key
       by sending a header, which would let them dodge the rate limit. */
    return req.ip || 'local';
}

/* Live email check used as the user types. */
router.post('/check-email', async (req, res) => {
    const limit = rateLimit('checkEmail', clientKey(req));
    if (limit.blocked) {
        return res.status(429).json({ ok: false, reason: `Too many checks. Try again in ${limit.retryAfter}s.` });
    }
    const email = normalizeEmail(req.body && req.body.email);
    const result = await checkEmail(email);
    res.json({ ok: result.ok, reason: result.reason });
});

/* Create an account. */
router.post('/signup', async (req, res) => {
    const ipLimit = rateLimit('signup', clientKey(req));
    if (ipLimit.blocked) {
        return res.status(429).json({ ok: false, reason: `Too many sign-up attempts. Try again in ${ipLimit.retryAfter}s.` });
    }

    const email = normalizeEmail(req.body && req.body.email);
    const password = String((req.body && req.body.password) || '');
    const name = String((req.body && req.body.name) || '').trim().slice(0, 60);

    const emailLimit = rateLimit('signin', 'signup:' + email);
    if (emailLimit.blocked) {
        return res.status(429).json({ ok: false, reason: 'That email asked for too many accounts. Wait a few minutes.' });
    }

    if (password.length < 8) {
        return res.status(400).json({ ok: false, reason: 'Use at least 8 characters for your password.' });
    }
    const check = await checkEmail(email);
    if (!check.ok) return res.status(400).json({ ok: false, reason: check.reason });

    const users = readUsers();
    if (users.some(u => u.email === email)) {
        return res.status(409).json({ ok: false, reason: 'That email already has an account. Sign in instead.' });
    }

    const user = {
        id: crypto.randomUUID(),
        email,
        name: name || email.split('@')[0],
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString()
    };
    users.push(user);
    writeUsers(users);
    createSession(req, res, user);

    res.status(201).json({ ok: true, user: { email: user.email, name: user.name } });
});

/* Sign in to an existing account. */
router.post('/signin', (req, res) => {
    const ipLimit = rateLimit('signin', clientKey(req));
    if (ipLimit.blocked) {
        return res.status(429).json({ ok: false, reason: `Too many tries. Try again in ${ipLimit.retryAfter}s.` });
    }

    const email = normalizeEmail(req.body && req.body.email);
    const password = String((req.body && req.body.password) || '');

    const emailLimit = rateLimit('signin', 'email:' + email);
    if (emailLimit.blocked) {
        return res.status(429).json({ ok: false, reason: 'Too many tries for that email. Wait a few minutes.' });
    }

    const users = readUsers();
    const user = users.find(u => u.email === email);
    // same message for "no account" and "wrong password" so nobody can probe emails
    if (!user || !verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({ ok: false, reason: 'Email or password is incorrect.' });
    }

    createSession(req, res, user);
    res.json({ ok: true, user: { email: user.email, name: user.name } });
});

/* Who am I? (used on page load to restore a session) */
router.get('/me', (req, res) => {
    const s = currentUser(req);
    if (!s) return res.json({ ok: true, user: null });
    res.json({ ok: true, user: { email: s.email, name: s.name } });
});

/* Sign out. */
router.post('/signout', (req, res) => {
    const token = readCookie(req, COOKIE);
    if (token) sessions.delete(token);
    res.clearCookie(COOKIE, { path: '/', secure: cookieSecure(req) });
    res.json({ ok: true });
});

/* ---------------------------- Google sign-in ----------------------------
   Server-side OAuth 2.0 (authorization code flow). The client secret never
   reaches the browser. Without GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET the
   button says so plainly instead of faking a login.
   Setup guide: docs/GOOGLE-SIGN-IN.md
   ------------------------------------------------------------------------ */
const settings = require('./config/settings');

const GOOGLE = settings.google;
const googleReady = () => !!(GOOGLE.clientId && GOOGLE.clientSecret);
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const STATE_COOKIE = 'mq_oauth_state';

let certCache = null;                           // Google's public keys, kept for an hour

async function googleCerts() {
    if (certCache && Date.now() - certCache.at < 60 * 60 * 1000) return certCache.keys;
    const r = await fetch(GOOGLE_CERTS_URL);
    if (!r.ok) throw new Error('Could not load Google signing keys.');
    const keys = (await r.json()).keys || [];
    certCache = { at: Date.now(), keys };
    return keys;
}

/* Check the ID token Google handed back: signature, issuer, audience, expiry. */
async function verifyGoogleIdToken(idToken) {
    const parts = String(idToken || '').split('.');
    if (parts.length !== 3) throw new Error('Bad ID token.');
    const [head, body, sig] = parts;
    const header = JSON.parse(Buffer.from(head, 'base64url').toString('utf8'));
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));

    if (header.alg !== 'RS256') throw new Error('Unexpected token algorithm.');
    const keys = await googleCerts();
    const jwk = keys.find(k => k.kid === header.kid);
    if (!jwk) throw new Error('Google key not found.');
    const pub = crypto.createPublicKey({ key: jwk, format: 'jwk' });
    const good = crypto.verify(
        'sha256',
        Buffer.from(`${head}.${body}`),
        pub,
        Buffer.from(sig, 'base64url')
    );
    if (!good) throw new Error('Token signature is not valid.');

    const now = Math.floor(Date.now() / 1000);
    const iss = payload.iss;
    if (iss !== 'accounts.google.com' && iss !== 'https://accounts.google.com') {
        throw new Error('Token came from the wrong issuer.');
    }
    if (payload.aud !== GOOGLE.clientId) throw new Error('Token was minted for another app.');
    if (!payload.exp || payload.exp < now) throw new Error('Google sign-in expired. Try again.');
    if (payload.email_verified === false) throw new Error('That Google email is not verified.');
    if (!payload.email) throw new Error('Google did not share an email address.');

    return payload;
}

/* Is Google configured? The sheet asks this before offering the button. */
router.get('/google-status', (req, res) => {
    if (!googleReady()) {
        const missing = [];
        if (!GOOGLE.clientId) missing.push('GOOGLE_CLIENT_ID');
        if (!GOOGLE.clientSecret) missing.push('GOOGLE_CLIENT_SECRET');
        return res.json({
            ok: true,
            available: false,
            reason: `Google sign-in needs ${missing.join(' and ')} in the .env file. See docs/GOOGLE-SIGN-IN.md.`
        });
    }
    res.json({ ok: true, available: true, reason: '' });
});

/* Step 1: send the browser to Google with a one-time state value. */
router.get('/google/start', (req, res) => {
    const limit = rateLimit('google', clientKey(req));
    if (limit.blocked) {
        return res.status(429).json({ ok: false, reason: `Too many Google attempts. Try again in ${limit.retryAfter}s.` });
    }
    if (!googleReady()) {
        return res.status(503).json({ ok: false, reason: 'Google sign-in is not set up yet.' });
    }

    const state = crypto.randomBytes(24).toString('hex');
    res.cookie(STATE_COOKIE, state, {
        httpOnly: true,
        secure: cookieSecure(req),
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000,
        path: '/api/auth'
    });

    const url = new URL(GOOGLE_AUTH_URL);
    url.searchParams.set('client_id', GOOGLE.clientId);
    url.searchParams.set('redirect_uri', GOOGLE.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid email profile');   // nothing more than a name and an email
    url.searchParams.set('state', state);
    url.searchParams.set('prompt', 'select_account');

    res.redirect(url.toString());
});

/* Step 2: Google sends the browser back here with a code. */
router.get('/google/callback', async (req, res) => {
    const back = (reason) => res.redirect('/?auth=error&reason=' + encodeURIComponent(reason));

    try {
        if (req.query.error) return back('Google sign-in was cancelled.');
        const code = String(req.query.code || '');
        const state = String(req.query.state || '');
        const expected = readCookie(req, STATE_COOKIE);
        res.clearCookie(STATE_COOKIE, { path: '/api/auth', secure: cookieSecure(req) });

        if (!code) return back('Google did not return a code. Try again.');
        if (!expected || state !== expected) return back('That sign-in link expired. Please try again.');
        if (!googleReady()) return back('Google sign-in is not set up yet.');

        const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: GOOGLE.clientId,
                client_secret: GOOGLE.clientSecret,
                redirect_uri: GOOGLE.redirectUri,
                grant_type: 'authorization_code'
            })
        });
        const tokenJson = await tokenRes.json().catch(() => ({}));
        if (!tokenRes.ok || !tokenJson.id_token) {
            console.error('Google token exchange failed:', tokenJson.error || tokenRes.status);
            return back('Google could not confirm the sign-in. Try again.');
        }

        const profile = await verifyGoogleIdToken(tokenJson.id_token);
        const email = normalizeEmail(profile.email);

        // Same email rules as the local sign up, so a blocked domain stays blocked.
        if (BAD_DOMAINS.has(email.split('@')[1])) return back('Please use a real inbox — that domain is blocked.');

        const users = readUsers();
        let user = users.find(u => u.googleId === profile.sub)
            || users.find(u => u.email === email);

        if (user) {
            // link the Google account to the existing local one, once
            if (!user.googleId) { user.googleId = profile.sub; }
            if (!user.name && profile.name) user.name = String(profile.name).slice(0, 60);
            writeUsers(users);
        } else {
            user = {
                id: crypto.randomUUID(),
                email,
                name: String(profile.name || email.split('@')[0]).slice(0, 60),
                googleId: profile.sub,
                provider: 'google',
                createdAt: new Date().toISOString()
            };
            users.push(user);
            writeUsers(users);
        }

        createSession(req, res, user);
        res.redirect('/?auth=google');
    } catch (err) {
        console.error('Google sign-in failed:', err.message);
        back(err.message || 'Google sign-in failed. Try again.');
    }
});

module.exports = { router, checkEmail };
