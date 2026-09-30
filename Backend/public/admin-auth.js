/**
 * SilverHouse Studio - Admin Authentication Guard
 * 
 * Enforces username & password login when accessed directly via URL,
 * while automatically honoring seamless SSO token handoffs from the frontend
 * WhatsApp OTP flow (no password asked if already verified via frontend).
 */

(function () {
    const TOKEN_KEY = 'silverhouse_admin_token';
    const USER_KEY = 'silverhouse_admin_user';

    // 1. Check for incoming SSO handoff token from Frontend OTP redirect (?auth_token=... or ?token=...)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('auth_token') || urlParams.get('token');
        if (urlToken) {
            localStorage.setItem(TOKEN_KEY, urlToken);
            urlParams.delete('auth_token');
            urlParams.delete('token');
        }
        // Clean up any sensitive or accidental query params (e.g. GET form submissions)
        if (urlParams.has('password') || urlParams.has('username')) {
            urlParams.delete('username');
            urlParams.delete('password');
        }
        const cleanQuery = urlParams.toString() ? '?' + urlParams.toString() : '';
        if (window.location.search !== cleanQuery) {
            window.history.replaceState({}, document.title, window.location.pathname + cleanQuery + window.location.hash);
        }
    } catch (e) {
        console.warn('[Admin Auth] Error inspecting URL token:', e);
    }

    // 2. Intercept native fetch() to automatically attach Admin Bearer token and handle 401
    const originalFetch = window.fetch;
    window.fetch = async function (input, init) {
        init = init || {};
        init.headers = init.headers || {};

        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            if (init.headers instanceof Headers) {
                if (!init.headers.has('Authorization')) {
                    init.headers.set('Authorization', 'Bearer ' + token);
                }
            } else if (Array.isArray(init.headers)) {
                const hasAuth = init.headers.some(([k]) => k.toLowerCase() === 'authorization');
                if (!hasAuth) init.headers.push(['Authorization', 'Bearer ' + token]);
            } else {
                if (!init.headers['Authorization'] && !init.headers['authorization']) {
                    init.headers['Authorization'] = 'Bearer ' + token;
                }
            }
        }

        try {
            const response = await originalFetch(input, init);
            // If server rejects with 401/403 for an admin API call, trigger re-authentication
            if ((response.status === 401 || response.status === 403) && typeof input === 'string' && input.includes('/api/admin/')) {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
                showAdminLoginModal('Your session has expired. Please sign in again.');
            }
            return response;
        } catch (err) {
            throw err;
        }
    };

    // Global Logout function
    window.shAdminLogout = function () {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        window.location.reload();
    };

    // 3. Inject CSS styles for Login Modal
    const styleEl = document.createElement('style');
    styleEl.id = 'sh-admin-auth-styles';
    styleEl.textContent = `
        #shAdminLoginOverlay {
            position: fixed;
            inset: 0;
            z-index: 999999;
            background: rgba(11, 15, 25, 0.88);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            animation: shFadeIn 0.25s ease-out forwards;
        }

        @keyframes shFadeIn {
            from { opacity: 0; transform: scale(0.98); }
            to { opacity: 1; transform: scale(1); }
        }

        .sh-login-card {
            width: 100%;
            max-width: 440px;
            background: #111827;
            border: 1px solid rgba(212, 175, 55, 0.4);
            border-radius: 20px;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(212, 175, 55, 0.1);
            overflow: hidden;
            color: #f3f4f6;
        }

        .sh-login-header {
            padding: 28px 24px 20px 24px;
            text-align: center;
            background: linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, transparent 100%);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .sh-brand-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(212, 175, 55, 0.15);
            border: 1px solid rgba(212, 175, 55, 0.4);
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            color: #f59e0b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
        }

        .sh-login-title {
            font-size: 22px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.5px;
            margin: 0;
        }

        .sh-login-subtitle {
            font-size: 13px;
            color: #9ca3af;
            margin-top: 6px;
        }

        .sh-login-body {
            padding: 24px;
        }

        .sh-form-group {
            margin-bottom: 18px;
        }

        .sh-form-label {
            display: block;
            font-size: 12px;
            font-weight: 600;
            color: #e5e7eb;
            margin-bottom: 7px;
            letter-spacing: 0.3px;
        }

        .sh-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }

        .sh-input {
            width: 100%;
            background: #1f2937;
            border: 1px solid #374151;
            border-radius: 10px;
            padding: 12px 14px;
            font-size: 14px;
            color: #ffffff;
            outline: none;
            transition: all 0.2s ease;
        }

        .sh-input:focus {
            border-color: #f59e0b;
            box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2);
            background: #1a2234;
        }

        .sh-pw-toggle {
            position: absolute;
            right: 12px;
            background: none;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
        }

        .sh-pw-toggle:hover {
            color: #f59e0b;
        }

        .sh-alert-box {
            padding: 11px 14px;
            background: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.4);
            border-radius: 10px;
            color: #fca5a5;
            font-size: 12.5px;
            margin-bottom: 18px;
            display: none;
            line-height: 1.4;
        }

        .sh-submit-btn {
            width: 100%;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: #111827;
            font-weight: 700;
            font-size: 14px;
            padding: 13px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
        }

        .sh-submit-btn:hover {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
        }

        .sh-submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        .sh-login-footer {
            padding: 16px 24px;
            background: rgba(0, 0, 0, 0.25);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            font-size: 11.5px;
            color: #6b7280;
            text-align: center;
            line-height: 1.5;
        }

        .sh-admin-user-badge {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(245, 158, 11, 0.12);
            border: 1px solid rgba(245, 158, 11, 0.3);
            color: #fcd34d;
            font-size: 12px;
            font-weight: 600;
            padding: 6px 12px;
            border-radius: 8px;
        }

        .sh-logout-btn {
            background: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.4);
            color: #fca5a5;
            font-size: 11px;
            font-weight: 700;
            padding: 4px 8px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .sh-logout-btn:hover {
            background: #ef4444;
            color: #ffffff;
        }
    `;
    document.head.appendChild(styleEl);

    // 4. Function to render the Admin Login Modal
    function showAdminLoginModal(initialErrorMsg) {
        // Prevent duplicate overlays
        if (document.getElementById('shAdminLoginOverlay')) {
            if (initialErrorMsg) {
                const errBox = document.getElementById('shAdminAlert');
                if (errBox) {
                    errBox.textContent = initialErrorMsg;
                    errBox.style.display = 'block';
                }
            }
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'shAdminLoginOverlay';
        overlay.innerHTML = `
            <div class="sh-login-card">
                <div class="sh-login-header">
                    <div class="sh-brand-badge">
                        <span>🛡️ SilverHouse Studio</span>
                    </div>
                    <h2 class="sh-login-title">Administrator Sign In</h2>
                    <p class="sh-login-subtitle">Direct access requires authorized administrative credentials.</p>
                </div>

                <div class="sh-login-body">
                    <div id="shAdminAlert" class="sh-alert-box">${initialErrorMsg || ''}</div>

                    <form id="shAdminLoginForm" autocomplete="on" onsubmit="return false;">
                        <div class="sh-form-group">
                            <label class="sh-form-label" for="shInputUser">Admin Username or Mobile</label>
                            <div class="sh-input-wrapper">
                                <input 
                                    type="text" 
                                    id="shInputUser" 
                                    name="username" 
                                    class="sh-input" 
                                    placeholder="e.g. admin or 9898790551" 
                                    required 
                                    autocomplete="username" 
                                    autofocus
                                />
                            </div>
                        </div>

                        <div class="sh-form-group">
                            <label class="sh-form-label" for="shInputPassword">Admin Password</label>
                            <div class="sh-input-wrapper">
                                <input 
                                    type="password" 
                                    id="shInputPassword" 
                                    name="password" 
                                    class="sh-input" 
                                    placeholder="••••••••" 
                                    required 
                                    autocomplete="current-password"
                                />
                                <button type="button" id="shTogglePwBtn" class="sh-pw-toggle" title="Show/Hide Password">👁️</button>
                            </div>
                        </div>

                        <button type="submit" id="shSubmitBtn" class="sh-submit-btn">
                            <span>Sign In to Admin Studio</span>
                            <span>→</span>
                        </button>
                    </form>
                </div>

                <div class="sh-login-footer">
                    🔒 Customers authenticate via WhatsApp OTP on the public store.<br/>
                    This terminal is restricted exclusively to authenticated administrators.
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        if (initialErrorMsg) {
            const errBox = document.getElementById('shAdminAlert');
            if (errBox) errBox.style.display = 'block';
        }

        // Toggle Password visibility
        const toggleBtn = document.getElementById('shTogglePwBtn');
        const pwInput = document.getElementById('shInputPassword');
        if (toggleBtn && pwInput) {
            toggleBtn.addEventListener('click', () => {
                const isPw = pwInput.type === 'password';
                pwInput.type = isPw ? 'text' : 'password';
                toggleBtn.textContent = isPw ? '🙈' : '👁️';
            });
        }

        // Handle Form Submission
        const form = document.getElementById('shAdminLoginForm');
        const errBox = document.getElementById('shAdminAlert');
        const submitBtn = document.getElementById('shSubmitBtn');

        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errBox.style.display = 'none';
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Verifying credentials...</span>`;

            const username = document.getElementById('shInputUser').value.trim();
            const password = document.getElementById('shInputPassword').value.trim();

            try {
                let userObj = null;
                let token = null;

                // 1. First attempt: Direct /api/admin/login endpoint
                try {
                    const res = await originalFetch('/api/admin/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });

                    const cType = res.headers.get('content-type') || '';
                    if (cType.includes('application/json')) {
                        const data = await res.json().catch(() => null);
                        if (res.ok && data && data.success) {
                            userObj = data.user;
                            token = data.token;
                        } else if (res.status === 401 && data && data.error) {
                            throw new Error(data.error);
                        }
                    }
                } catch (netErr) {
                    if (netErr.message && netErr.message.includes('Invalid admin')) {
                        throw netErr;
                    }
                }

                // 2. Secondary fallback: If dedicated endpoint is 404 (e.g. server hasn't restarted yet),
                // validate directly via stored procedure through /api/data
                if (!userObj) {
                    const fallbackRes = await originalFetch('/api/data', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            proc_name: 'user',
                            opr: 'LOGIN',
                            table_values: { username, password }
                        })
                    });

                    let fallbackData = null;
                    const cType = fallbackRes.headers.get('content-type') || '';
                    if (cType.includes('application/json')) {
                        fallbackData = await fallbackRes.json();
                    } else {
                        const rawText = await fallbackRes.text();
                        try {
                            fallbackData = JSON.parse(rawText);
                        } catch {
                            throw new Error(fallbackRes.status === 404
                                ? 'Authentication service is unavailable (404). Please verify server status.'
                                : `Server communication error (${fallbackRes.status})`);
                        }
                    }

                    if (!fallbackRes.ok || !fallbackData.success) {
                        const rawErr = (fallbackData && (fallbackData.error || fallbackData.status)) || 'Invalid admin username or password.';
                        const cleanMsg = String(rawErr).replace(/^ERROR\s*\[\d+\]:\s*/i, '');
                        throw new Error(cleanMsg);
                    }

                    const authedUser = Array.isArray(fallbackData.data) && fallbackData.data[0];
                    if (!authedUser || String(authedUser.role).toUpperCase() !== 'ADMIN') {
                        throw new Error('Access denied: Unauthorized administrative account.');
                    }

                    userObj = {
                        userId: authedUser.user_id,
                        fullName: authedUser.full_name,
                        phone: authedUser.phone,
                        role: 'ADMIN'
                    };
                    token = btoa(JSON.stringify(userObj));
                }

                // Successful authentication!
                localStorage.setItem(TOKEN_KEY, token);
                if (userObj) {
                    localStorage.setItem(USER_KEY, JSON.stringify(userObj));
                }

                // Remove modal
                overlay.remove();

                // Inject user header badge
                injectAdminUserBadge(userObj);

                // If host page has loadData or refresh function, execute it
                if (typeof window.loadData === 'function') {
                    window.loadData();
                } else {
                    window.location.reload();
                }

            } catch (err) {
                errBox.textContent = err.message || 'Authentication failed. Please verify credentials.';
                errBox.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<span>Sign In to Admin Studio</span><span>→</span>`;
            }
        });
    }

    // 5. Function to inject logged-in Admin Profile & Logout button into Topbar
    function injectAdminUserBadge(user) {
        if (!user) return;
        const topBar = document.querySelector('.top-bar') || document.querySelector('header');
        if (!topBar || document.getElementById('shAdminBadgeContainer')) return;

        const container = document.createElement('div');
        container.id = 'shAdminBadgeContainer';
        container.style.marginLeft = 'auto';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.gap = '10px';

        const name = user.fullName || user.full_name || 'Admin';
        container.innerHTML = `
            <div class="sh-admin-user-badge">
                <span>👑 ${name} (Admin)</span>
                <button type="button" class="sh-logout-btn" onclick="shAdminLogout()" title="Sign out of Admin Studio">Logout</button>
            </div>
        `;

        const actionControls = topBar.querySelector('.action-controls');
        if (actionControls) {
            actionControls.parentNode.insertBefore(container, actionControls);
        } else {
            topBar.appendChild(container);
        }
    }

    // 6. Verify Session on Page Load
    async function checkAdminSession() {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            // Direct access without token: prompt for username and password
            showAdminLoginModal();
            return;
        }

        try {
            let isValid = false;
            let verifiedUser = null;

            // Attempt session verification against /api/admin/me
            try {
                const res = await originalFetch('/api/admin/me', {
                    headers: { 'Authorization': 'Bearer ' + token }
                });

                if (res.ok) {
                    const cType = res.headers.get('content-type') || '';
                    if (cType.includes('application/json')) {
                        const data = await res.json().catch(() => null);
                        if (data && data.success && data.isAdmin) {
                            isValid = true;
                            verifiedUser = data.user;
                        }
                    }
                }
            } catch (e) {
                // If network/endpoint error, proceed to fallback token validation
            }

            // Fallback validation: inspect decoded base64 token if /api/admin/me is offline or 404
            if (!isValid) {
                try {
                    const decoded = JSON.parse(atob(token));
                    if (decoded && decoded.userId && String(decoded.role).toUpperCase() === 'ADMIN') {
                        isValid = true;
                        verifiedUser = decoded;
                    }
                } catch {
                    isValid = false;
                }
            }

            if (isValid && verifiedUser) {
                localStorage.setItem(USER_KEY, JSON.stringify(verifiedUser));
                injectAdminUserBadge(verifiedUser);
            } else {
                throw new Error('Invalid session');
            }
        } catch (e) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            showAdminLoginModal();
        }
    }

    // Run verification once DOM is loaded or immediately if already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAdminSession);
    } else {
        checkAdminSession();
    }
})();
