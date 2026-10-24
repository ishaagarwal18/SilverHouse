import { API_BASE_URL, resolveImageUrl } from '../../services/api.js';

export const ADMIN_TOKEN_KEY = 'silverhouse_admin_token';
export const ADMIN_USER_KEY = 'silverhouse_admin_user';
export const PLACEHOLDER_IMG = '/images/placeholder.svg';

let unauthorizedHandler = null;

/** Registers the callback fired when an /admin/* endpoint rejects the session (401/403). */
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}

export function getAdminToken() {
  try {
    const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem('silverhouse_admin_token');
    if (adminToken) return adminToken;
    const storeToken = localStorage.getItem('silverhouse_token');
    const storeUser = JSON.parse(localStorage.getItem('silverhouse_user') || 'null');
    if (storeToken && String(storeUser?.role).toUpperCase() === 'ADMIN') {
      return storeToken;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * fetch() wrapper for the Admin Studio: prefixes the API base URL, attaches the
 * admin Bearer token, serialises JSON bodies and parses the JSON response.
 * `path` is relative to /api, e.g. '/data' or '/admin/analytics'.
 */
export async function adminFetch(path, { method = 'GET', body, headers = {}, skipAuth = false } = {}) {
  const finalHeaders = { ...headers };
  const token = getAdminToken();
  if (token && !skipAuth && !finalHeaders.Authorization) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  let payload = body;
  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { method, headers: finalHeaders, body: payload });

  if ((res.status === 401 || res.status === 403) && !skipAuth) {
    unauthorizedHandler?.('Your session has expired. Please sign in again.');
  }

  const data = await res.json().catch(() => null);
  if (data === null) {
    throw new Error(res.status === 404
      ? 'Service is unavailable (404). Please verify server status.'
      : `Server communication error (${res.status})`);
  }
  return { ok: res.ok, status: res.status, data };
}

/**
 * Calls the generic stored-procedure endpoint (POST /api/data).
 * Returns the raw JSON response ({ success, data, status, error }).
 */
export async function callProc(procName, opr, tableValues, condition) {
  const body = { proc_name: procName, opr };
  if (tableValues !== undefined) body.table_values = tableValues;
  if (condition !== undefined) body.condition = condition === null ? null : String(condition);
  const { data } = await adminFetch('/data', { method: 'POST', body });
  return data;
}

/** Like callProc but throws on failure and returns the `data` rows. */
export async function callProcOrThrow(procName, opr, tableValues, condition) {
  const result = await callProc(procName, opr, tableValues, condition);
  if (!result.success) throw new Error(cleanErrorMessage(result.status || result.error) || 'Operation failed');
  return result.data;
}

/** SELECT all rows of a table (empty array on failure). */
export async function fetchRows(procName, condition) {
  const result = await callProc(procName, 'SELECT', undefined, condition);
  return Array.isArray(result.data) ? result.data : [];
}

/** Uploads one image to /api/upload and returns its stored URL (e.g. /uploads/img-123.jpg). */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('imageFile', file);
  const { data } = await adminFetch('/upload', { method: 'POST', body: formData });
  if (!data.success || !data.imageUrl) throw new Error(data.error || 'Upload failed');
  return data.imageUrl;
}

/**
 * Stores an image URL in dbo.image and links it to the product via dbo.product_image.
 * Failures are logged but never block the product save.
 */
export async function linkProductImage(productId, imageUrl) {
  if (!productId || !imageUrl) return;
  try {
    const imgJson = await callProc('image', 'ADD', { image_url: imageUrl });
    const newImageId = imgJson.data?.[0]?.NewImageId || imgJson.data?.image_id;
    if (newImageId) {
      await callProc('product_image', 'ADD', { product_id: productId, image_id: newImageId });
    }
  } catch (err) {
    console.warn('Image link notice:', err);
  }
}

/** Strips SQL error prefixes and converts database constraint codes into friendly English. */
export function cleanErrorMessage(raw) {
  if (!raw) return '';
  const str = String(raw);
  if (str.includes('REFERENCE constraint') || str.includes('547')) {
    if (str.includes('address') || str.includes('FK__orders__address')) {
      return 'This address is linked to existing orders.';
    }
    return 'This record cannot be deleted because other records depend on it.';
  }
  return str.replace(/^ERROR\s*\[\d+\]:\s*/i, '').trim();
}

/** Resolves a product/record image (string, object or array) to a displayable URL. */
export function adminImageUrl(img) {
  if (Array.isArray(img)) img = img[0];
  const resolved = resolveImageUrl(img);
  if (!resolved) return PLACEHOLDER_IMG;
  return resolved.startsWith('http') || resolved.startsWith('/') || resolved.startsWith('data:') ? resolved : `/${resolved}`;
}

/** First image of a product row (images[] or image_url). */
export function productImage(p) {
  if (Array.isArray(p?.images) && p.images.length > 0) return p.images[0];
  return p?.image_url || '';
}

export function formatINR(val) {
  return '₹' + (Number(val) || 0).toLocaleString('en-IN');
}

/** Formats any date / ISO timestamp into clear, unambiguous format: "22 Oct 2026, 04:36 PM" or "22 Oct 2026" */
export function formatAdminDateOrTime(val, colName = '') {
  if (val === null || val === undefined || val === '' || val === '-') return '-';
  try {
    const col = String(colName || '').toLowerCase();
    const str = String(val).trim();

    // Check if column is designated for date-only (or string is YYYY-MM-DD)
    const isDateOnlyCol = ['birthday', 'anniversary', 'birth', 'start_date', 'end_date', 'date'].some(k => col.includes(k)) || /^\d{4}-\d{2}-\d{2}$/.test(str);

    // If string is YYYY-MM-DD, parse year, month, day directly to avoid UTC day-shift
    const ymd = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isDateOnlyCol && ymd) {
      const d = new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    const d = new Date(val);
    if (isNaN(d.getTime())) return str;

    const day = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); // "22 Oct 2026"
    if (isDateOnlyCol) return day;

    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }); // "04:36 PM"
    return `${day}, ${time}`;
  } catch {
    return String(val);
  }
}

/** Formats a date value as date-only (e.g. "22 Oct 2026") */
export function formatAdminDate(val) {
  if (val === null || val === undefined || val === '' || val === '-') return '-';
  try {
    const str = String(val).trim();
    const ymd = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (ymd) {
      const d = new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    const d = new Date(val);
    if (isNaN(d.getTime())) return str;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return String(val);
  }
}

/** Check if column name or cell value represents a date or timestamp */
export function isDateLikeColumnOrValue(colName, val) {
  if (val === null || val === undefined || val === '' || val === '-') return false;
  const col = String(colName || '').toLowerCase();
  const dateColKeywords = ['date', '_at', 'time', 'created', 'updated', 'birthday', 'anniversary'];
  if (dateColKeywords.some(k => col.includes(k))) return true;

  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (/^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}/.test(trimmed)) return true;
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return true;
  }
  return false;
}
