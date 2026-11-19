/* ====================================================================
   SAMPLE DATA (a stub for the outside world)
   --------------------------------------------------------------------
   The "I have no token and still need to demo" source. It reads the
   same demo-data.js file the browser uses, so the page and the server
   never disagree. Nothing here costs money or needs the internet.
   ==================================================================== */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FILE = path.join(__dirname, '..', '..', 'js', 'data', 'demo-data.js');

function loadDemoData() {
    try {
        const code = fs.readFileSync(FILE, 'utf8');
        const sandbox = { window: {}, console };
        vm.createContext(sandbox);
        vm.runInContext(code, sandbox);
        return sandbox.window.DemoData || {};
    } catch (err) {
        console.error('Could not read demo data:', err.message);
        return {};
    }
}

/* What a real scrape would hand back: the whole messy batch, marked as
   sample. The cleaning pipeline decides what survives - that is its job. */
function fetchRawPosts(query) {
    const demo = loadDemoData();
    const all = demo.rawPosts || [];
    return all.map(p => ({ ...p, source: 'sample', query: query || '' }));
}

module.exports = { fetchRawPosts, loadDemoData };
