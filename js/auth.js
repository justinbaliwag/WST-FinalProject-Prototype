/* ============================================================================
   Marqueuet — sign in / sign up / guest on the landing page
   ----------------------------------------------------------------------------
   The sheet opens when "Get Started" is clicked. Three ways in:
     - Sign up / Sign in  -> local server (accounts on this computer)
     - Continue with guest -> browser flag only, no account
     - Google             -> real Google sign-in when GOOGLE_CLIENT_ID and
                             GOOGLE_CLIENT_SECRET are in .env (else it says so)
   ========================================================================== */

(() => {
    'use strict';

    const API = '/api/auth';
    const GUEST_KEY = 'marqueuet_guest';
    const PENDING_KEY = 'marqueuet_pending_view';

    let state = { user: null, guest: false, mode: 'signup' };
    let busy = false;

    /* ------------------------------ build UI ------------------------------ */
    const scrim = document.createElement('div');
    scrim.className = 'mq-auth-scrim';
    scrim.setAttribute('role', 'dialog');
    scrim.setAttribute('aria-modal', 'true');
    scrim.setAttribute('aria-labelledby', 'mqAuthTitle');
    scrim.innerHTML = `
      <div class="mq-auth-sheet" role="document">
        <button type="button" class="mq-auth-close" aria-label="Close">&times;</button>

        <span class="mq-auth-mark"><i></i>Marqueuet</span>
        <h2 class="mq-auth-title" id="mqAuthTitle">Welcome back</h2>
        <p class="mq-auth-sub" id="mqAuthSub">One workspace for every brand matchup you want to read.</p>

        <div class="mq-auth-tabs" role="tablist" aria-label="Sign in or sign up">
          <button type="button" role="tab" data-mode="signin" aria-selected="false">Sign in</button>
          <button type="button" role="tab" data-mode="signup" aria-selected="true">Sign up</button>
        </div>

        <form id="mqAuthForm" novalidate>
          <div class="mq-field" id="mqNameField" hidden>
            <label for="mqName">Your name <span aria-hidden="true">(optional)</span></label>
            <input id="mqName" type="text" autocomplete="name" placeholder="Juan" maxlength="60">
          </div>

          <div class="mq-field">
            <label for="mqEmail">Email</label>
            <input id="mqEmail" type="email" autocomplete="email" placeholder="you@example.com" required>
            <div class="mq-hint" id="mqEmailHint"></div>
          </div>

          <div class="mq-field">
            <label for="mqPassword">Password</label>
            <input id="mqPassword" type="password" autocomplete="new-password" placeholder="At least 8 characters" required>
            <div class="mq-hint" id="mqPassHint"></div>
          </div>

          <button type="submit" class="mq-auth-primary" id="mqSubmit">Create account</button>
        </form>

        <div class="mq-auth-msg" id="mqMsg" role="status" aria-live="polite"></div>

        <div class="mq-auth-or">or</div>

        <button type="button" class="mq-auth-google" id="mqGoogle">
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.6 30.4 0 24 0 14.6 0 6.4 4.9 2.4 12l7.9 6.1C16.5 13 20 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9h12.4c-.5 2.9-2.2 5.3-4.7 6.9l7.6 5.9c4.4-4.1 6.8-10.1 6.8-17.2z"/>
            <path fill="#FBBC05" d="M10.3 28.1c-.5-1.4-.8-2.9-.8-4.1s.3-2.7.8-4.1l-7.9-6.1C.9 17.1 0 20.4 0 24s.9 6.9 2.4 10.2l7.9-6.1z"/>
            <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.8-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.2 2.3-4 0-7.5-3.5-9.7-8.5l-7.9 6.1C6.4 43.1 14.6 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <div class="mq-auth-divider"></div>

        <button type="button" class="mq-auth-guest" id="mqGuest">Continue as a guest</button>

        <p class="mq-auth-foot" id="mqFoot">Local demo build &middot; accounts stay <b>on this computer</b></p>
      </div>
    `;
    document.body.appendChild(scrim);

    const sheet = scrim.querySelector('.mq-auth-sheet');
    const titleEl = scrim.querySelector('#mqAuthTitle');
    const subEl = scrim.querySelector('#mqAuthSub');
    const form = scrim.querySelector('#mqAuthForm');
    const nameField = scrim.querySelector('#mqNameField');
    const nameInput = scrim.querySelector('#mqName');
    const emailInput = scrim.querySelector('#mqEmail');
    const passInput = scrim.querySelector('#mqPassword');
    const emailHint = scrim.querySelector('#mqEmailHint');
    const passHint = scrim.querySelector('#mqPassHint');
    const submitBtn = scrim.querySelector('#mqSubmit');
    const msgEl = scrim.querySelector('#mqMsg');
    const googleBtn = scrim.querySelector('#mqGoogle');
    const guestBtn = scrim.querySelector('#mqGuest');
    const closeBtn = scrim.querySelector('.mq-auth-close');
    const tabs = [...scrim.querySelectorAll('.mq-auth-tabs button')];

    /* -------------------------- signed-in chip ----------------------------- */
    const header = document.getElementById('pvHeader');
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'mq-user-chip';
    chip.innerHTML = '<span class="mq-user-avatar"></span><span class="mq-user-name"></span>';
    if (header) header.insertBefore(chip, header.querySelector('.pv-cta-pill'));

    function paintChip() {
        if (!chip) return;
        if (state.user) {
            chip.classList.add('is-on');
            chip.querySelector('.mq-user-avatar').textContent = (state.user.name || state.user.email).charAt(0).toUpperCase();
            chip.querySelector('.mq-user-name').textContent = state.user.name || state.user.email;
            chip.title = state.user.email + ' — click to sign out';
        } else if (state.guest) {
            chip.classList.add('is-on');
            chip.querySelector('.mq-user-avatar').textContent = 'G';
            chip.querySelector('.mq-user-name').textContent = 'Guest';
            chip.title = 'Browsing as a guest — click to sign in';
        } else {
            chip.classList.remove('is-on');
        }
    }

    chip.addEventListener('click', () => {
        if (state.user) signOut();
        else openSheet('signin');
    });

    /* ------------------------------ messages ------------------------------ */
    function say(text, kind) {
        msgEl.textContent = text || '';
        msgEl.className = 'mq-auth-msg' + (text ? ' is-' + (kind || 'error') : '');
    }

    function setBusy(v) {
        busy = v;
        submitBtn.disabled = v;
        submitBtn.textContent = v
            ? 'One moment…'
            : (state.mode === 'signup' ? 'Create account' : 'Sign in');
    }

    /* ------------------------------- modes -------------------------------- */
    function setMode(mode) {
        state.mode = mode;
        const signup = mode === 'signup';
        tabs.forEach(t => t.setAttribute('aria-selected', String(t.dataset.mode === mode)));
        nameField.hidden = !signup;
        passInput.autocomplete = signup ? 'new-password' : 'current-password';
        passInput.placeholder = signup ? 'At least 8 characters' : 'Your password';
        titleEl.textContent = signup ? 'Create your account' : 'Welcome back';
        subEl.textContent = signup
            ? 'Make an account to keep your matchups, or try it as a guest first.'
            : 'Sign in to pick up where you left off.';
        submitBtn.textContent = signup ? 'Create account' : 'Sign in';
        say('');
        passHint.textContent = '';
        emailHint.textContent = '';
        emailHint.className = 'mq-hint';
    }

    tabs.forEach(t => t.addEventListener('click', () => setMode(t.dataset.mode)));

    /* --------------------------- email live check -------------------------- */
    let emailTimer = null;
    emailInput.addEventListener('input', () => {
        clearTimeout(emailTimer);
        const value = emailInput.value.trim();
        if (!value) { emailHint.textContent = ''; emailHint.className = 'mq-hint'; return; }
        emailHint.textContent = 'Checking…';
        emailHint.className = 'mq-hint';
        emailTimer = setTimeout(async () => {
            try {
                const r = await post('/check-email', { email: value });
                if (!emailInput.value.trim()) return;
                if (r.ok) {
                    emailHint.textContent = 'Looks good.';
                    emailHint.className = 'mq-hint is-good';
                } else {
                    emailHint.textContent = r.reason || 'That email cannot be used.';
                    emailHint.className = 'mq-hint is-bad';
                }
            } catch (_) {
                emailHint.textContent = 'Cannot reach the server — start it with npm start.';
                emailHint.className = 'mq-hint is-bad';
            }
        }, 400);
    });

    passInput.addEventListener('input', () => {
        if (state.mode !== 'signup') { passHint.textContent = ''; return; }
        const n = passInput.value.length;
        if (!n) { passHint.textContent = ''; return; }
        passHint.textContent = n < 8 ? `${8 - n} more characters needed.` : 'Good length.';
        passHint.className = 'mq-hint' + (n < 8 ? ' is-bad' : ' is-good');
    });

    /* ------------------------------ requests ------------------------------ */
    async function post(path, body) {
        const res = await fetch(API + path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body || {})
        });
        let data = {};
        try { data = await res.json(); } catch (_) {}
        if (!res.ok) throw Object.assign(new Error(data.reason || 'Request failed'), { data, status: res.status });
        return data;
    }

    form.addEventListener('submit', async e => {
        e.preventDefault();
        if (busy) return;

        const email = emailInput.value.trim();
        const password = passInput.value;
        if (!email) return say('Enter your email address.');
        if (!password) return say('Enter your password.');
        if (state.mode === 'signup' && password.length < 8) return say('Use at least 8 characters for your password.');

        setBusy(true);
        say('');
        try {
            const r = await post(state.mode === 'signup' ? '/signup' : '/signin', {
                email, password, name: nameInput.value.trim()
            });
            state.user = r.user;
            state.guest = false;
            try { localStorage.removeItem(GUEST_KEY); } catch (_) {}
            paintChip();
            say('Signed in. Opening your workspace…', 'ok');
            setTimeout(() => { closeSheet(); enterApp(); }, 700);
        } catch (err) {
            const reason = (err.data && err.data.reason) || err.message || 'Something went wrong.';
            say(reason);
            if (err.status === 429) msgEl.classList.add('is-warn');
        } finally {
            setBusy(false);
        }
    });

    googleBtn.addEventListener('click', async () => {
        if (googleBtn.disabled || busy) return;
        if (!googleAvailable) await checkGoogle();
        if (!googleAvailable) {
            return say(googleBtn.dataset.reason || 'Google sign-in is not set up yet.', 'warn');
        }
        say('Opening Google…');
        try {
            if (!sessionStorage.getItem(PENDING_KEY)) sessionStorage.setItem(PENDING_KEY, 'compare');
        } catch (_) {}
        // Server-side flow: the browser leaves for Google and comes back signed in.
        window.location.assign(API + '/google/start');
    });

    guestBtn.addEventListener('click', () => {
        state.guest = true;
        state.user = null;
        try { localStorage.setItem(GUEST_KEY, '1'); } catch (_) {}
        paintChip();
        closeSheet();
        enterApp();
    });

    /* --------------------------- open / close ----------------------------- */
    let lastFocused = null;

    function openSheet(mode) {
        lastFocused = document.activeElement;
        setMode(mode || (state.user ? 'signin' : 'signup'));
        scrim.classList.add('is-open');
        document.documentElement.classList.add('mq-auth-lock');
        const hero = document.getElementById('heroLanding');
        if (hero) hero.inert = true;
        checkGoogle();
        setTimeout(() => (state.mode === 'signup' ? emailInput : emailInput).focus(), 260);
    }

    function closeSheet() {
        scrim.classList.remove('is-open');
        document.documentElement.classList.remove('mq-auth-lock');
        const hero = document.getElementById('heroLanding');
        if (hero && !hero.classList.contains('is-hidden')) hero.inert = false;
        if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    closeBtn.addEventListener('click', closeSheet);
    scrim.addEventListener('mousedown', e => { if (e.target === scrim) closeSheet(); });
    scrim.addEventListener('keydown', e => {
        if (e.key === 'Escape') { e.stopPropagation(); closeSheet(); return; }
        if (e.key !== 'Tab') return;
        // keep focus inside the sheet while it is open
        const focusables = [...sheet.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])')]
            .filter(el => !el.disabled && el.offsetParent !== null);
        if (!focusables.length) return;
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    /* ------------------------------ enter app ----------------------------- */
    function enterApp() {
        let view = 'compare';
        try {
            const pending = sessionStorage.getItem(PENDING_KEY);
            if (pending) { view = pending; sessionStorage.removeItem(PENDING_KEY); }
        } catch (_) {}
        if (window.enterWorkspace) window.enterWorkspace(view);
    }

    /* Replace the direct "Get Started" jumps with the sign-in sheet. */
    function gate(targetView, ev) {
        if (state.user || state.guest) {
            if (window.enterWorkspace) window.enterWorkspace(targetView, ev);
            return;
        }
        try { sessionStorage.setItem(PENDING_KEY, targetView || 'compare'); } catch (_) {}
        openSheet('signup');
    }
    window.mqRequestAuth = gate;

    // Every existing "Get Started" button calls enterWorkspace directly; capture
    // those clicks on the landing page before they reach the app shell.
    const landing = document.getElementById('heroLanding');
    if (landing) {
        landing.addEventListener('click', e => {
            const trigger = e.target.closest('[onclick*="enterWorkspace"], #heroGetStartedBtn, .pv-cta-pill');
            if (!trigger) return;
            if (state.user || state.guest) return;      // already through, let it pass
            e.preventDefault();
            e.stopImmediatePropagation();
            gate('compare', e);
        }, true);
    }

    /* openMatchup (from landing.js) must also respect the gate */
    const originalOpenMatchup = window.openMatchup;
    window.openMatchup = function (q, mode, ev) {
        if (!state.user && !state.guest) { gate('compare', ev); return; }
        if (originalOpenMatchup) originalOpenMatchup(q, mode, ev);
    };

    /* ----------------------------- google status --------------------------- */
    // Ask the server whether Google is set up. If not, the button says why
    // instead of sending anyone to a broken page.
    let googleAvailable = false;
    async function checkGoogle() {
        try {
            const r = await fetch(API + '/google-status', { credentials: 'include' });
            const data = await r.json();
            googleAvailable = !!data.available;
            googleBtn.dataset.reason = data.reason || '';
            googleBtn.classList.toggle('is-off', !googleAvailable);
            if (!googleAvailable) googleBtn.setAttribute('aria-describedby', 'mqGoogleNote');
        } catch (_) {
            googleAvailable = false;
        }
        return googleAvailable;
    }

    googleBtn.addEventListener('mouseenter', () => {
        if (!googleAvailable && googleBtn.dataset.reason) say(googleBtn.dataset.reason, 'warn');
    });

    /* ------------------------------ session ------------------------------- */
    async function restore() {
        try {
            const r = await fetch(API + '/me', { credentials: 'include' });
            const data = await r.json();
            if (data && data.user) { state.user = data.user; state.guest = false; }
        } catch (_) {
            // server not running: still allow guest browsing
        }
        if (!state.user) {
            try { state.guest = localStorage.getItem(GUEST_KEY) === '1'; } catch (_) {}
        }
        paintChip();
        if (window.__mqGuest) window.__mqGuest = state.guest || !!state.user;
    }

    async function signOut() {
        try { await fetch(API + '/signout', { method: 'POST', credentials: 'include' }); } catch (_) {}
        state.user = null;
        state.guest = false;
        try { localStorage.removeItem(GUEST_KEY); } catch (_) {}
        paintChip();
        say('');
        openSheet('signin');
    }

    /* Coming back from Google: the server redirects to /?auth=google or
       /?auth=error&reason=... so the page can say what happened. */
    async function handleGoogleReturn() {
        let params;
        try { params = new URLSearchParams(window.location.search); } catch (_) { return; }
        const auth = params.get('auth');
        if (!auth) return;

        const clean = window.location.pathname;
        try { window.history.replaceState({}, '', clean); } catch (_) {}

        if (auth === 'google') {
            await restore();
            if (state.user) {
                try { localStorage.removeItem(GUEST_KEY); } catch (_) {}
                paintChip();
                openSheet('signin');
                say(`Signed in as ${state.user.name || state.user.email}.`, 'ok');
                setTimeout(() => { closeSheet(); enterApp(); }, 700);
                return;
            }
            openSheet('signin');
            say('Google signed you in, but the session did not stick. Try again.', 'warn');
            return;
        }

        openSheet('signin');
        say(params.get('reason') || 'Google sign-in did not complete.', 'warn');
    }

    setMode('signup');
    restore().then(() => {
        checkGoogle();
        handleGoogleReturn();
    });
})();
