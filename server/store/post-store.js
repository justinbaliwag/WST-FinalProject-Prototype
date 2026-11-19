/* ====================================================================
   LOCAL STORE (the "database")
   --------------------------------------------------------------------
   One small JSON file inside the project keeps the cleaned posts, so
   they survive a restart and can be read back by query. No install, no
   server, no account: copying the folder copies the data with it.

   A later phase can swap this for a real database: only the functions
   below are used by the rest of the server.
   ==================================================================== */

const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DB_DIR, 'posts.json');

function emptyDb() {
    return { version: 1, posts: [], runs: [] };
}

function readDb() {
    try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.posts)) return emptyDb();
        return parsed;
    } catch (_) {
        return emptyDb();
    }
}

function writeDb(db) {
    fs.mkdirSync(DB_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

/* Save cleaned posts. Reposts of a post already saved are skipped. */
function savePosts(posts, runInfo = {}) {
    const db = readDb();
    const known = new Set(db.posts.map(p => p.fingerprint));
    let added = 0;

    (posts || []).forEach(post => {
        const fp = post.fingerprint || post.id;
        if (!fp || known.has(fp)) return;
        known.add(fp);
        db.posts.push({ ...post, fingerprint: fp, savedAt: new Date().toISOString() });
        added++;
    });

    db.runs.push({
        query: runInfo.query || '',
        source: runInfo.source || 'unknown',
        kept: posts ? posts.length : 0,
        added,
        dropped: runInfo.droppedCount || 0,
        reasons: runInfo.reasons || {},
        at: new Date().toISOString()
    });
    db.runs = db.runs.slice(-50);

    writeDb(db);
    return { added, total: db.posts.length };
}

/* Joining words and filler that say nothing about which brand was asked for.
   Without this, "Jollibee vs McDo and Huawei" matched any post containing
   the word "and". */
const STOP_WORDS = new Set([
    'and', 'vs', 'versus', 'the', 'for', 'with', 'from', 'that', 'this', 'are', 'was', 'has'
]);

/* Read saved posts back, newest first, optionally narrowed by query words. */
function findPosts(query, limit = 20) {
    const db = readDb();
    const words = String(query || '').toLowerCase()
        .split(/\s+/)
        .map(w => w.replace(/[.,;:!?]+$/g, ''))
        .filter(w => w.length > 2 && !STOP_WORDS.has(w));
    const matched = words.length
        ? db.posts.filter(p => words.some(w => (p.caption || '').toLowerCase().includes(w)))
        : db.posts;
    return matched.slice(-limit).reverse();
}

function stats() {
    const db = readDb();
    return {
        posts: db.posts.length,
        runs: db.runs.length,
        lastRun: db.runs[db.runs.length - 1] || null,
        file: path.relative(path.join(__dirname, '..'), DB_FILE)
    };
}

module.exports = { savePosts, findPosts, stats, DB_FILE };
