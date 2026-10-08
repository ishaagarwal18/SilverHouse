import { API_BASE_URL, getAuthToken } from './api';

/**
 * Dynamically loads the official Razorpay Checkout SDK (checkout.js).
 * Returns true if loaded successfully or already present.
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('[Razorpay] Failed to load official checkout.js SDK from CDN.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Fetches Razorpay public configuration from backend.
 * @returns {Promise<{success: boolean, keyId?: string, isConfigured: boolean, currency: string, companyName: string, themeColor: string}>}
 */
export async function fetchRazorpayConfig() {
  try {
    const res = await fetch(`${API_BASE_URL}/payment/razorpay/config`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('[Razorpay] Failed to fetch gateway config:', err.message);
    return {
      success: false,
      keyId: '',
      isConfigured: false,
      currency: 'INR',
      companyName: 'SilverHouse',
      themeColor: '#D4AF37'
    };
  }
}

/**
 * Creates a Razorpay order on the backend for standard cart checkout.
 * @param {number} amount In Rupees
 * @param {string} receipt
 * @param {object} notes
 */
export async function createRazorpayOrder(amount, receipt, notes = {}) {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/payment/razorpay/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ amount, receipt, notes })
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('[Razorpay] Order creation error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Verifies Razorpay payment signature and completes order creation on backend.
 * @param {{razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string, orderPayload: object}} payload
 */
export async function verifyRazorpayPayment(payload) {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/payment/razorpay/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('[Razorpay] Payment verification error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Creates a Razorpay order for an approved Custom/Bespoke order.
 * @param {number|string} orderId
 */
export async function createCustomOrderRazorpayOrder(orderId) {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/custom-orders/${orderId}/create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('[Razorpay] Custom order payment creation error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * High-level helper: Opens Razorpay standard checkout modal with SilverHouse brand theme.
 * Returns a Promise that resolves when payment is completed or dismissed.
 *
 * @param {object} params
 * @param {string} params.keyId
 * @param {object} params.order Razorpay order object from backend
 * @param {string} [params.name]
 * @param {string} [params.description]
 * @param {string} [params.image]
 * @param {object} [params.prefill] { name, email, contact }
 * @param {string} [params.themeColor]
 * @returns {Promise<{success: boolean, response?: object, dismissed?: boolean, error?: string}>}
 */
export async function launchRazorpayCheckout({
  keyId,
  order,
  name = 'SilverHouse Artisanal Silver',
  description = 'Sacred 925 & 999 Artisanal Silver Creation',
  image = '',
  prefill = {},
  themeColor = '#D4AF37'
}) {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    return {
      success: false,
      error: 'Could not load Razorpay payment window. Please check your internet connection.'
    };
  }

  return new Promise((resolve) => {
    let hasResolved = false;

    const options = {
      key: keyId,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: name,
      description: description,
      order_id: order.id,
      prefill: {
        name: prefill.name || '',
        email: prefill.email || '',
        contact: prefill.contact || prefill.phone || ''
      },
      theme: {
        color: themeColor || '#D4AF37',
        backdrop_color: 'rgba(0,0,0,0.85)'
      },
      modal: {
        confirm_close: true,
        ondismiss: () => {
          if (!hasResolved) {
            hasResolved = true;
            resolve({ success: false, dismissed: true, error: 'Payment window was closed.' });
          }
        }
      },
      handler: (response) => {
        if (!hasResolved) {
          hasResolved = true;
          resolve({
            success: true,
            response: {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            }
          });
        }
      }
    };

    if (image) {
      options.image = image;
    }

    try {
      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', function (failResponse) {
        console.warn('[Razorpay] Payment failed event:', failResponse.error);
      });
      rzpInstance.open();
    } catch (err) {
      if (!hasResolved) {
        hasResolved = true;
        resolve({ success: false, error: err.message || 'Failed to open Razorpay modal.' });
      }
    }
  });
}
