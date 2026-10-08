// Base API URL configured via .env files (localhost, render, production)
const DEFAULT_PRODUCTION_API = 'https://api.silverhouseindia.com/api';
let rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();

// When running frontend in local browser development (localhost / 127.0.0.1),
// automatically route requests to the local backend server on port 5001.
if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  if (!rawApiUrl.includes('localhost') && !rawApiUrl.includes('127.0.0.1') && !import.meta.env.VITE_FORCE_REMOTE) {
    rawApiUrl = 'http://localhost:5001/api';
  }
}

if (!rawApiUrl) {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    rawApiUrl = DEFAULT_PRODUCTION_API;
  } else {
    rawApiUrl = 'http://localhost:5001/api';
  }
}

// Ensure external host URLs point to the /api endpoint
if (rawApiUrl.startsWith('http') && !rawApiUrl.endsWith('/api')) {
  rawApiUrl = rawApiUrl.replace(/\/+$/, '') + '/api';
}

export const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

/**
 * Returns active user or admin token stored in browser localStorage
 */
export function getAuthToken() {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('silverhouse_token') || localStorage.getItem('silverhouse_admin_token') || null;
}

// Helpful console info indicating active environment
if (typeof window !== 'undefined') {
  console.log(`%c[SilverHouse API] Active Environment: ${import.meta.env.VITE_ENV_NAME || 'default'} | Endpoint: ${API_BASE_URL}`, 'color: #0284c7; font-weight: bold;');
}

/**
 * Resolves image paths (absolute URLs, local assets, or backend uploads) to valid displayable URLs.
 */
export function resolveImageUrl(img) {
  if (!img) return '';
  const val = typeof img === 'object' ? (img.image_url || img.url || '') : String(img);
  const trimmed = String(val).trim();
  if (!trimmed) return '';
  // Already an absolute HTTP/HTTPS or data URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  // Static local bundled assets in /images/
  if (trimmed.startsWith('/images/') || trimmed.startsWith('images/')) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }
  // Uploaded images from the deployed admin panel (/product_image/... or img-...)
  if (trimmed.startsWith('/product_image/') || trimmed.startsWith('product_image/') || trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/') || trimmed.startsWith('img-')) {
    let filename = trimmed.replace(/^\/?(product_image|uploads)\//, '');
    const backendBase = API_BASE_URL.replace(/\/api\/?$/, '');
    return `${backendBase}/product_image/${filename}`;
  }
  return trimmed;
}

/**
 * Normalizes raw backend product object to frontend component interface.
 */
export function normalizeProduct(rawItem) {
  if (!rawItem) return null;

  // Process images array
  let images = [];
  if (Array.isArray(rawItem.images) && rawItem.images.length > 0) {
    images = rawItem.images.map(resolveImageUrl).filter(Boolean);
  } else if (rawItem.images_json) {
    try {
      const parsed = JSON.parse(rawItem.images_json);
      images = Array.isArray(parsed) ? parsed.map(resolveImageUrl).filter(Boolean) : [];
    } catch {
      images = [];
    }
  } else if (rawItem.image_url) {
    const resolved = resolveImageUrl(rawItem.image_url);
    images = resolved ? [resolved] : [];
  }

  if (images.length === 0) {
    images = ['/images/placeholder.svg'];
  }

  const rawPrice = Number(rawItem.price) || Number(rawItem.original_price) || 1000;
  const discount = Number(rawItem.discount) || 0;
  const finalPrice = rawItem.final_price !== undefined && rawItem.final_price !== null
    ? Math.round(Number(rawItem.final_price))
    : (discount > 0 ? Math.round(rawPrice * (1 - discount / 100)) : rawPrice);

  // Derive purity & purityCode accurately from DB 'purity' or 'purity_code'
  const rawPurity = String(rawItem.purity || rawItem.purity_code || rawItem.purityCode || '').trim();
  let purityCode = '925';
  if (rawPurity.includes('999') || rawPurity.includes('99.9')) {
    purityCode = '999';
  } else if (rawPurity.includes('925') || rawPurity.includes('92.5')) {
    purityCode = '925';
  } else if (rawItem.purity_code) {
    purityCode = String(rawItem.purity_code);
  }

  const purity = rawItem.purity && String(rawItem.purity).trim() !== ''
    ? String(rawItem.purity).trim()
    : (purityCode === '999' ? '999 Pure Silver' : '925 Sterling Silver');

  // Exact database values for sold and review count (no manual default overrides)
  const sold = rawItem.sold !== undefined && rawItem.sold !== null ? Number(rawItem.sold) : 0;
  const reviewCount = rawItem.review !== undefined && rawItem.review !== null
    ? Number(rawItem.review)
    : (rawItem.reviews_count !== undefined && rawItem.reviews_count !== null ? Number(rawItem.reviews_count) : (Number(rawItem.reviews) || 0));

  return {
    id: String(rawItem.id || rawItem.product_id || rawItem.code || Math.random().toString(36).substring(2, 9)),
    product_id: Number(rawItem.product_id || rawItem.id),
    category_id: rawItem.category_id !== undefined && rawItem.category_id !== null ? Number(rawItem.category_id) : null,
    name: rawItem.product_name || rawItem.name || rawItem.title || 'Pure Silver Item',
    title: rawItem.title || rawItem.product_name || rawItem.name || 'Pure Silver Item',
    category: (rawItem.slug || rawItem.category_slug || rawItem.category_name || rawItem.category || 'silver-idols').toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    category_slug: (rawItem.category_slug || rawItem.slug || rawItem.category || '').toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    subcategory: (rawItem.subcategory_name || rawItem.subcategory || 'all').toLowerCase().replace(/\s+/g, '-'),
    purity: purity,
    purityCode: purityCode,
    weightGrams: parseFloat(rawItem.weight) || 10,
    price: finalPrice,
    originalPrice: discount > 0 ? rawPrice : null,
    discount: discount,
    rating: Number(rawItem.rating) || 4.8,
    reviewsCount: reviewCount,
    review: reviewCount,
    sold: sold,
    priority: Number(rawItem.priority || 0),
    quantity: Number(rawItem.quantity !== undefined && rawItem.quantity !== null ? rawItem.quantity : 0),
    inStock: rawItem.quantity !== undefined ? Number(rawItem.quantity) > 0 : true,
    isBestSeller: Boolean(rawItem.is_bestseller || rawItem.isBestSeller || false),
    isCustomizable: Boolean(rawItem.is_customizable || rawItem.isCustomizable || false),
    recipient: rawItem.ideal_for || rawItem.recipient || 'Gifting, Puja',
    images: images,
    color: rawItem.color || 'Silver',
    occasions: Array.isArray(rawItem.occasions) ? rawItem.occasions : (rawItem.ideal_for ? [rawItem.ideal_for] : []),
    shortDesc: rawItem.description || rawItem.shortDesc || 'Authentic pure silver product with BIS Hallmark quality assurance.',
    specs: typeof rawItem.specs === 'object' ? rawItem.specs : {
      "Metal Purity": purity,
      "Weight": rawItem.weight ? `${rawItem.weight}` : "10 Grams",
      "Craftsmanship": rawItem.make_type || "Handcrafted Luxury Finish",
      "Color": rawItem.color || "Silver",
      "Ideal For": rawItem.ideal_for || "Puja, Luxury Gifting"
    }
  };
}

/**
 * Fetches all products live from Backend Database API (/api/data).
 */
export async function fetchProducts(filters = null) {
  try {
    const json = await postApiData({
      proc_name: 'product',
      opr: 'SELECT',
      table_values: filters ? { filters } : null
    });

    if (json && json.success && Array.isArray(json.data)) {
      const normalized = json.data.map(normalizeProduct).filter(Boolean);
      console.log(`[API Service] Loaded ${normalized.length} products live from Database via Express Backend.`);
      return normalized;
    } else {
      console.warn('[API Service] Backend returned empty or invalid data set:', json);
      return [];
    }
  } catch (error) {
    console.error('[API Service] Could not connect to Express Backend at /api/data:', error);
    return [];
  }
}

/**
 * Fetches categories list directly from Backend API (/api/data with proc_name: 'category').
 * Falls back to CATEGORIES if backend is unavailable.
 */
export async function fetchCategories() {
  try {
    const json = await postApiData({
      proc_name: 'category',
      opr: 'SELECT'
    });

    if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data.map(cat => {
        const resolvedImg = resolveImageUrl(cat.image_url || cat.image || null);
        return {
          id: (cat.slug || cat.name || String(cat.category_id)).toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
          slug: (cat.slug || cat.name || String(cat.category_id)).toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
          category_id: cat.category_id,
          name: cat.name || 'Category',
          shortName: cat.name || 'Category',
          description: cat.description || 'Sacred 925 & 999 Pure Silver Items',
          idealFor: cat.ideal_for || 'All',
          image_id: cat.image_id || null,
          image_url: resolvedImg || (cat.image_url || cat.image || ''),
          image: resolvedImg || (cat.image_url || cat.image || ''),
          heroBanner: resolvedImg || (cat.image_url || cat.image || '') || '/images/placeholder.svg'
        };
      });
    }
  } catch (err) {
    console.warn('[API Service] Category fetch warning:', err);
  }
  return [];
}

/**
 * Fetches festivals dynamically from Backend API (/api/festivals) or fallback.
 */
export async function fetchFestivals() {
  try {
    const response = await fetch(`${API_BASE_URL}/festivals`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.success && Array.isArray(data.festivals)) {
        return data.festivals.map(fest => ({
          id: fest.id,
          category_id: fest.category_id,
          name: fest.name,
          shortName: fest.shortName,
          description: fest.description,
          image: resolveImageUrl(fest.image),
          image_url: resolveImageUrl(fest.image_url),
          heroBanner: resolveImageUrl(fest.heroBanner),
          idealFor: fest.idealFor,
          priority_val: fest.priority_val
        }));
      }
    }
  } catch (err) {
    console.warn('[API Service] Festival fetch warning, trying fallback:', err);
  }

  try {
    const json = await postApiData({
      proc_name: 'festival',
      opr: 'SELECT'
    });
    if (json && json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (err) {
    console.warn('[API Service] Festivals fallback fetch warning:', err);
  }

  return [];
}

/**
 * Fetches festival-category mappings from Backend API (/api/data with proc_name: 'festival_category').
 */
export async function fetchFestivalCategories() {
  try {
    const json = await postApiData({
      proc_name: 'festival_category',
      opr: 'SELECT'
    });
    if (json && json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (err) {
    console.warn('[API Service] Festival Categories fetch warning:', err);
  }
  return [];
}

/**
 * Fetches a single product by ID from Backend API.
 */
export async function fetchProductById(productId) {
  try {
    const json = await postApiData({
      proc_name: 'product',
      opr: 'SELECT',
      condition: productId
    });
    if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
      return normalizeProduct(json.data[0]);
    }
  } catch (err) {
    console.warn('[API Service] fetchProductById warning:', err);
  }
  return null;
}

/**
 * Submits an order or form submission to Backend API (/api/data).
 */
export async function postApiData(payload) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/data`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (response.status === 401 && token && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('silverhouse_unauthorized'));
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok && !data.error) {
        data.error = data.message || `Server returned status ${response.status}`;
      }
      return data;
    } else {
      const text = await response.text();
      console.warn('[API Service] Non-JSON response received:', response.status, text.slice(0, 300));
      return {
        success: false,
        error: response.status === 401
          ? 'Sign in is required for this action. Please sign in or continue as guest.'
          : response.status === 404
            ? 'Endpoint not found (404). Please ensure the API is reachable.'
            : `Server returned status ${response.status}. Please try again.`
      };
    }
  } catch (error) {
    console.error('[API Service] Error sending data to backend:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetches all saved addresses for a given user from dbo.address via SP_address.
 */
export async function fetchUserAddresses(userId) {
  if (!userId) return [];
  try {
    const json = await postApiData({
      proc_name: 'address',
      opr: 'SELECT',
      table_values: { user_id: userId }
    });

    if (json && json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (err) {
    console.warn('[API Service] Error fetching user addresses:', err);
  }
  return [];
}

/**
 * Adds a new address for a user to dbo.address.
 */
export async function addUserAddress(addressData) {
  try {
    const payload = {
      proc_name: 'address',
      opr: 'ADD',
      table_values: {
        user_id: addressData.userId || addressData.user_id,
        address_name: addressData.address_name || addressData.addressName || 'Home',
        recipient_name: addressData.recipient_name || addressData.recipientName,
        Block: addressData.Block || addressData.block,
        street: addressData.street,
        area: addressData.area,
        city: addressData.city,
        state: addressData.state,
        pincode: addressData.pincode,
        country: addressData.country || 'India'
      }
    };
    return await postApiData(payload);
  } catch (err) {
    console.error('[API Service] Error adding address:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Updates an existing address in dbo.address.
 */
export async function updateUserAddress(addressId, addressData) {
  try {
    return await postApiData({
      proc_name: 'address',
      opr: 'UPDATE',
      condition: String(addressId),
      table_values: addressData
    });
  } catch (err) {
    console.error('[API Service] Error updating address:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Deletes an address from dbo.address by ID.
 */
export async function deleteUserAddress(addressId) {
  try {
    return await postApiData({
      proc_name: 'address',
      opr: 'DELETE',
      condition: String(addressId)
    });
  } catch (err) {
    console.error('[API Service] Error deleting address:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetches saved wishlist items for a given user from dbo.wishlist.
 */
export async function fetchUserWishlist(userId) {
  try {
    const json = await postApiData({
      proc_name: 'wishlist',
      opr: 'SELECT',
      condition: String(userId)
    });
    if (json && json.success && Array.isArray(json.data)) {
      return json.data;
    }
    return [];
  } catch (err) {
    console.warn('[API Service] Could not fetch user wishlist:', err.message);
    return [];
  }
}

/**
 * Inserts an item into dbo.wishlist in the database.
 */
export async function addToWishlistApi(userId, productId) {
  try {
    return await postApiData({
      proc_name: 'wishlist',
      opr: 'ADD',
      table_values: {
        user_id: Number(userId),
        product_id: Number(productId)
      }
    });
  } catch (err) {
    console.error('[API Service] Error adding to wishlist:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Removes an item from dbo.wishlist in the database.
 */
export async function removeFromWishlistApi(userId, productId) {
  try {
    return await postApiData({
      proc_name: 'wishlist',
      opr: 'DELETE',
      table_values: {
        user_id: Number(userId),
        product_id: Number(productId)
      }
    });
  } catch (err) {
    console.error('[API Service] Error removing from wishlist:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Returns a stable guest token stored in localStorage for guest sessions.
 */
export function getGuestToken() {
  let token = localStorage.getItem('silverhouse_guest_token');
  if (!token) {
    token = 'guest_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    localStorage.setItem('silverhouse_guest_token', token);
  }
  return token;
}

/**
 * Adds or increments an item in dbo.cart and dbo.cart_item.
 */
export async function addToCartApi({ userId, guestToken, productId, quantity = 1 }) {
  try {
    const token = guestToken || getGuestToken();
    return await postApiData({
      proc_name: 'cart_item',
      opr: 'ADD',
      table_values: {
        user_id: userId ? Number(userId) : null,
        guest_token: token,
        product_id: Number(productId),
        quantity: Number(quantity)
      }
    });
  } catch (err) {
    console.error('[API Service] Error adding item to cart in DB:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Updates item quantity in dbo.cart_item.
 */
export async function updateCartQtyApi({ userId, guestToken, productId, quantity }) {
  try {
    const token = guestToken || getGuestToken();
    return await postApiData({
      proc_name: 'cart_item',
      opr: 'UPDATE_QTY',
      table_values: {
        user_id: userId ? Number(userId) : null,
        guest_token: token,
        product_id: Number(productId),
        quantity: Number(quantity)
      }
    });
  } catch (err) {
    console.error('[API Service] Error updating cart qty in DB:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Removes an item from dbo.cart_item.
 */
export async function removeCartItemApi({ userId, guestToken, productId }) {
  try {
    const token = guestToken || getGuestToken();
    return await postApiData({
      proc_name: 'cart_item',
      opr: 'DELETE',
      table_values: {
        user_id: userId ? Number(userId) : null,
        guest_token: token,
        product_id: Number(productId)
      }
    });
  } catch (err) {
    console.error('[API Service] Error removing cart item from DB:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Clears all items from user's or guest's cart in dbo.cart_item.
 */
export async function clearCartApi({ userId, guestToken }) {
  try {
    const token = guestToken || getGuestToken();
    return await postApiData({
      proc_name: 'cart_item',
      opr: 'DELETE',
      table_values: {
        user_id: userId ? Number(userId) : null,
        guest_token: token
      }
    });
  } catch (err) {
    console.error('[API Service] Error clearing cart in DB:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Creates an order record in dbo.orders and order items in dbo.order_item.
 */
export async function createOrderApi(orderPayload) {
  try {
    return await postApiData({
      proc_name: 'orders',
      opr: 'ADD',
      table_values: orderPayload
    });
  } catch (err) {
    console.error('[API Service] Error placing order in DB:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetches current cart items directly from dbo.cart and dbo.cart_item.
 */
export async function fetchUserCartApi({ userId, guestToken }) {
  try {
    const token = guestToken || getGuestToken();
    const json = await postApiData({
      proc_name: 'cart_item',
      opr: 'SELECT',
      table_values: {
        user_id: userId ? Number(userId) : null,
        guest_token: token
      }
    });
    if (json && json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (err) {
    console.warn('[API Service] Error fetching cart items from DB:', err);
  }
  return [];
}

/**
 * Submits a bespoke artisanal order request with multi-file inspiration photos.
 * @param {FormData} formData
 * @returns {Promise<{success: boolean, order?: object, error?: string, message?: string}>}
 */
export async function submitCustomOrderApi(formData) {
  try {
    const url = `${API_BASE_URL}/custom-orders`;
    const headers = {};
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });
    const json = await response.json();
    return json;
  } catch (err) {
    console.error('[API Service] Error submitting custom order:', err);
    return { success: false, error: err.message || 'Failed to submit custom order request.' };
  }
}

/**
 * Fetches all custom orders belonging to the customer by userId or phone.
 * @param {{ userId?: number, phone?: string }} params
 * @returns {Promise<{success: boolean, orders: Array, total: number}>}
 */
export async function fetchCustomerCustomOrdersApi({ userId, phone } = {}) {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (phone) params.append('phone', phone);

    const url = `${API_BASE_URL}/custom-orders/my-orders?${params.toString()}`;
    const headers = {};
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { headers });
    const data = await res.json();
    if (data.success && Array.isArray(data.orders)) {
      return data;
    }
    return { success: true, orders: [], total: 0 };
  } catch (err) {
    console.warn('[API Service] Error fetching customer custom orders:', err);
    return { success: false, orders: [], total: 0, error: err.message };
  }
}

/**
 * Confirms payment for an approved custom order.
 * @param {number|string} orderId
 * @returns {Promise<{success: boolean, message?: string, order?: object, error?: string}>}
 */
export async function payCustomOrderApi(orderId) {
  try {
    const url = `${API_BASE_URL}/custom-orders/${orderId}/pay`;
    const headers = { 'Content-Type': 'application/json' };
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, {
      method: 'POST',
      headers
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('[API Service] Error paying for custom order:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetches store parameters (Theme, WhatsApp API, Current Festival) directly from the database table.
 * @returns {Promise<{success: boolean, parameters?: object, error?: string}>}
 */
export async function fetchStoreParameters() {
  try {
    const url = `${API_BASE_URL}/parameters`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('[API Service] Notice: Could not load store_parameter from database:', err.message);
    return {
      success: false,
      error: err.message,
      parameters: null
    };
  }
}

/**
 * Updates store parameters (Admin only).
 * @param {object} params
 * @returns {Promise<{success: boolean, parameters?: object, error?: string}>}
 */
export async function updateStoreParameters(params) {
  try {
    const url = `${API_BASE_URL}/admin/parameters`;
    const headers = { 'Content-Type': 'application/json' };
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(params)
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('[API Service] Error updating store parameters:', err);
    return { success: false, error: err.message };
  }
}
/**
 * Official verified company details for Silver House
 */
export const DEFAULT_COMPANY_DETAILS = {
  company_id: 1,
  name: 'Silver House',
  proprietor: 'Sunil K Agarwal',
  business_type: 'Manufacturer & Trader of Silver Products',
  address: '217, Kanak Chamber, Gandhi Road',
  city: 'Ahmedabad',
  state: 'Gujarat',
  pincode: '380058',
  contact_number: '9537178477',
  email: 'sunilag28017@gmail.com',
  pan_card: 'ADDPA8283B',
  gst_no: null
};

/**
 * Fetches official company details directly from the database table (dbo.company / SP_Fetchdata).
 */
export async function fetchCompanyDetails() {
  try {
    const url = `${API_BASE_URL}/company`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    if (data.success && data.company) {
      return { success: true, company: data.company };
    }
    return { success: true, company: DEFAULT_COMPANY_DETAILS };
  } catch (err) {
    console.warn('[API Service] Notice: Using official company details fallback:', err.message);
    return {
      success: true,
      company: DEFAULT_COMPANY_DETAILS
    };
  }
}

/**
 * Records a customer's product view into dbo.viewed (and local storage for guests).
 */
export async function recordProductView(productId, userId = null) {
  if (!productId) return;
  const numId = parseInt(productId, 10);
  if (isNaN(numId)) return;

  // 1. Maintain local history in localStorage for instant retrieval & offline resilience
  try {
    const rawLocal = localStorage.getItem('silverhouse_recently_viewed');
    let localIds = rawLocal ? JSON.parse(rawLocal) : [];
    if (!Array.isArray(localIds)) localIds = [];
    localIds = [numId, ...localIds.filter(id => Number(id) !== numId)].slice(0, 15);
    localStorage.setItem('silverhouse_recently_viewed', JSON.stringify(localIds));
  } catch (e) {
    console.warn('[Recently Viewed] LocalStorage write failed:', e);
  }

  // 2. Synchronize with database table dbo.viewed
  try {
    const activeUserId = userId || (() => {
      try {
        const u = JSON.parse(localStorage.getItem('silverhouse_user') || '{}');
        return u.userId || u.user_id || u.id || null;
      } catch {
        return null;
      }
    })();

    const token = localStorage.getItem('silverhouse_token') || '';
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch(`${API_BASE_URL}/viewed`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        productId: numId,
        userId: activeUserId
      })
    });
  } catch (err) {
    // Non-blocking background sync notice
    console.warn('[Recently Viewed] Backend sync notice:', err.message);
  }
}

/**
 * Fetches recently viewed products from dbo.viewed (or local IDs fallback).
 */
export async function fetchRecentlyViewed(userId = null) {
  try {
    const activeUserId = userId || (() => {
      try {
        const u = JSON.parse(localStorage.getItem('silverhouse_user') || '{}');
        return u.userId || u.user_id || u.id || null;
      } catch {
        return null;
      }
    })();

    const rawLocal = localStorage.getItem('silverhouse_recently_viewed');
    const localIds = rawLocal ? JSON.parse(rawLocal) : [];
    const localIdStr = Array.isArray(localIds) && localIds.length > 0 ? localIds.join(',') : '';

    let url = `${API_BASE_URL}/viewed`;
    if (activeUserId) {
      url += `?userId=${activeUserId}`;
    } else if (localIdStr) {
      url += `?productIds=${localIdStr}`;
    } else {
      return [];
    }

    const token = localStorage.getItem('silverhouse_token') || '';
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { headers });
    if (!res.ok) return [];
    const json = await res.json();

    if (json.success && Array.isArray(json.data)) {
      return json.data.map(normalizeProduct).filter(Boolean);
    }
    return [];
  } catch (err) {
    console.warn('[Recently Viewed] Fetch error:', err.message);
    return [];
  }
}

/**
 * Fetches all reviews for a product from the backend.
 */
export async function fetchProductReviews(productId) {
  if (!productId) return { reviews: [], total: 0, averageRating: 5.0 };
  try {
    const res = await fetch(`${API_BASE_URL}/reviews?productId=${productId}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return {
          reviews: json.data,
          total: json.total !== undefined ? json.total : json.data.length,
          averageRating: json.averageRating !== undefined ? json.averageRating : 5.0
        };
      }
    }
  } catch (err) {
    console.warn('[API Service] fetchProductReviews error:', err.message);
  }
  return { reviews: [], total: 0, averageRating: 5.0 };
}

/**
 * Uploads customer review photos to the backend.
 */
export async function uploadReviewPhotos(files) {
  if (!files || files.length === 0) return [];
  try {
    const formData = new FormData();
    const slice = Array.from(files).slice(0, 5);
    slice.forEach(f => formData.append('images', f));

    const headers = {};
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/upload-multiple`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.imageUrls)) {
        return json.imageUrls;
      }
    }
  } catch (err) {
    console.warn('[API Service] uploadReviewPhotos error:', err.message);
  }
  return [];
}

/**
 * Submits a new customer review to the backend.
 */
export async function submitProductReview({ productId, userId = null, star = 5, description = '', photos = [] }) {
  try {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('silverhouse_token') : '';
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        productId,
        userId,
        star,
        description,
        photos
      })
    });

    const json = await res.json();
    return json;
  } catch (err) {
    console.error('[API Service] submitProductReview error:', err.message);
    return { success: false, error: err.message };
  }
}

