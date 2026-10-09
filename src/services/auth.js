import { API_BASE_URL } from './api';

// Resolves to /api/auth in local dev, or https://api.silverhouseindia.com/api/auth in production
const API_BASE = `${API_BASE_URL}/auth`;

/**
 * Login user with email & password
 */
export async function loginUser(email, password) {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Backend server is offline or returned status ${res.status}. Please make sure backend is running.`);
    }

    if (!res.ok || !data.success) {
      throw new Error(data?.error || 'Invalid credentials');
    }
    return data;
  } catch (err) {
    throw err;
  }
}

/**
 * Register new customer user
 */
export async function registerUser({ fullName, email, phone, password }) {
  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, phone, password })
    });

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Backend server is offline or returned status ${res.status}. Please make sure backend is running.`);
    }

    if (!res.ok || !data.success) {
      throw new Error(data?.error || 'Registration failed');
    }
    return data;
  } catch (err) {
    throw err;
  }
}

/**
 * Send WhatsApp OTP to phone number
 */
export async function sendPhoneOtp(phone, mode, extraData = {}) {
  try {
    const res = await fetch(`${API_BASE}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, mode, ...extraData })
    });

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Server returned status ${res.status}. Please ensure backend is running.`);
    }

    if (!res.ok || !data.success) {
      throw new Error(data?.error || 'Failed to send OTP to WhatsApp.');
    }
    return data;
  } catch (err) {
    throw err;
  }
}

/**
 * Verify WhatsApp OTP and sign in / register
 */
export async function verifyPhoneOtp(phone, otp, fullName, extraData = {}) {
  try {
    const payload = typeof fullName === 'object' && fullName !== null
      ? { phone, otp, ...fullName }
      : { phone, otp, fullName, ...extraData };

    const res = await fetch(`${API_BASE}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Server returned status ${res.status}. Please ensure backend is running.`);
    }

    if (!res.ok || !data.success) {
      throw new Error(data?.error || 'Invalid OTP code.');
    }
    return data;
  } catch (err) {
    throw err;
  }
}

/**
 * Verify current active user session via token
 */
export async function fetchCurrentUser(token) {
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) return data.user;
  } catch (err) {
    console.warn('[Auth Service] Token verification failed:', err.message);
  }
  return null;
}

/**
 * Update user profile details
 */
export async function updateUserProfile(profileData, token) {
  try {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(profileData)
    });

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Server returned unexpected response (status ${res.status}). Please make sure backend is running.`);
    }

    if (!res.ok || !data.success) {
      throw new Error(data?.error || 'Failed to update profile.');
    }
    return data;
  } catch (err) {
    throw err;
  }
}

