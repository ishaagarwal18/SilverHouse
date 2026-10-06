import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  ADMIN_TOKEN_KEY,
  ADMIN_USER_KEY,
  adminFetch,
  callProc,
  cleanErrorMessage,
  setUnauthorizedHandler
} from '../api/adminApi';

const AdminAuthContext = createContext(null);

function safeGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
}
function safeRemove(key) {
  try { localStorage.removeItem(key); } catch { /* storage unavailable */ }
}

/** Decodes the backend's base64 admin token; returns the user object if it is an ADMIN. */
function decodeAdminToken(token) {
  try {
    const decoded = JSON.parse(atob(token));
    if (decoded?.userId && String(decoded.role).toUpperCase() === 'ADMIN') return decoded;
  } catch { /* not a decodable token */ }
  return null;
}

/**
 * Picks up a token handed over by the storefront: ?auth_token= / ?token= in the URL,
 * or an existing storefront session whose user is an ADMIN (WhatsApp OTP login).
 */
function captureHandoffToken() {
  try {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('auth_token') || params.get('token');
    if (urlToken) safeSet(ADMIN_TOKEN_KEY, urlToken);
    ['auth_token', 'token', 'username', 'password'].forEach(k => params.delete(k));
    const cleanQuery = params.toString() ? `?${params}` : '';
    if (window.location.search !== cleanQuery) {
      window.history.replaceState(window.history.state, document.title, window.location.pathname + cleanQuery + window.location.hash);
    }
  } catch (e) {
    console.warn('[Admin Auth] Error inspecting URL token:', e);
  }

  if (!safeGet(ADMIN_TOKEN_KEY)) {
    try {
      const storeUser = JSON.parse(safeGet('silverhouse_user') || 'null');
      const storeToken = safeGet('silverhouse_token');
      if (storeToken && String(storeUser?.role).toUpperCase() === 'ADMIN') {
        safeSet(ADMIN_TOKEN_KEY, storeToken);
      }
    } catch { /* ignore malformed storefront session */ }
  }
  return safeGet(ADMIN_TOKEN_KEY);
}

export function AdminAuthProvider({ children }) {
  // 'checking' | 'authenticated' | 'unauthenticated'
  const [status, setStatus] = useState('checking');
  const [user, setUser] = useState(null);
  const [notice, setNotice] = useState('');

  const clearSession = useCallback((message = '') => {
    safeRemove(ADMIN_TOKEN_KEY);
    safeRemove(ADMIN_USER_KEY);
    setUser(null);
    setNotice(message);
    setStatus('unauthenticated');
  }, []);

  const acceptSession = useCallback((token, userObj) => {
    safeSet(ADMIN_TOKEN_KEY, token);
    safeSet(ADMIN_USER_KEY, JSON.stringify(userObj));
    setUser(userObj);
    setNotice('');
    setStatus('authenticated');
  }, []);

  // Verify the stored session once on load
  useEffect(() => {
    let cancelled = false;
    setUnauthorizedHandler(msg => clearSession(msg));

    (async () => {
      const token = captureHandoffToken();
      if (!token) {
        if (!cancelled) setStatus('unauthenticated');
        return;
      }

      let verifiedUser = null;
      try {
        const { ok, data } = await adminFetch('/admin/me', { skipAuth: true, headers: { Authorization: `Bearer ${token}` } });
        if (ok && data?.success && data.isAdmin) verifiedUser = data.user;
      } catch { /* endpoint offline: fall back to local token validation */ }

      if (!verifiedUser) verifiedUser = decodeAdminToken(token);
      if (cancelled) return;

      if (verifiedUser) acceptSession(token, verifiedUser);
      else clearSession();
    })();

    return () => {
      cancelled = true;
      setUnauthorizedHandler(null);
    };
  }, [acceptSession, clearSession]);

  /** Username/password sign-in, with the stored-procedure fallback used by the legacy portal. */
  const login = useCallback(async (username, password) => {
    let userObj = null;
    let token = null;

    try {
      const { ok, status: httpStatus, data } = await adminFetch('/admin/login', {
        method: 'POST',
        skipAuth: true,
        body: { username, password }
      });
      if (ok && data?.success) {
        userObj = data.user;
        token = data.token;
      } else if (httpStatus === 401 && data?.error) {
        throw new Error(data.error);
      }
    } catch (err) {
      if (err.message?.includes('Invalid admin')) throw err;
    }

    // Fallback: validate through the user stored procedure if /admin/login is unavailable
    if (!userObj) {
      const result = await callProc('user', 'LOGIN', { username, password });
      if (!result.success) {
        throw new Error(cleanErrorMessage(result.error || result.status) || 'Invalid admin username or password.');
      }
      const authedUser = Array.isArray(result.data) && result.data[0];
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

    acceptSession(token, userObj);
  }, [acceptSession]);

  const logout = useCallback(() => clearSession(), [clearSession]);

  return (
    <AdminAuthContext.Provider value={{ status, user, notice, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return ctx;
}
