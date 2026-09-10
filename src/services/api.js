import { PRODUCTS } from '../data/products';

// Base API URL (proxied via Vite server to backend port 5000)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Normalizes raw backend product object to frontend component interface.
 */
export function normalizeProduct(rawItem) {
  if (!rawItem) return null;

  // Process images array
  let images = [];
  if (Array.isArray(rawItem.images) && rawItem.images.length > 0) {
    images = rawItem.images.map(img => typeof img === 'object' ? (img.image_url || img.url) : img).filter(Boolean);
  } else if (rawItem.images_json) {
    try {
      const parsed = JSON.parse(rawItem.images_json);
      images = Array.isArray(parsed) ? parsed.map(i => typeof i === 'object' ? i.image_url : i) : [];
    } catch {
      images = [];
    }
  } else if (rawItem.image_url) {
    images = [rawItem.image_url];
  }

  if (images.length === 0) {
    images = [""];
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
    name: rawItem.product_name || rawItem.name || 'Pure Silver Item',
    category: (rawItem.slug || rawItem.category_slug || rawItem.category_name || rawItem.category || 'silver-coins-bars').toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
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
 * Fetches all products from Backend API (/api/data).
 * Falls back to mock PRODUCTS dataset if backend is unreachable or returns error.
 */
export async function fetchProducts(filters = null) {
  try {
    const json = await postApiData({
      proc_name: 'product',
      opr: 'SELECT',
      table_values: filters ? { filters } : null
    });

    if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
      const normalized = json.data.map(normalizeProduct).filter(Boolean);
      console.log(`[API Service] Loaded ${normalized.length} products live from Express Backend.`);
      return normalized;
    } else {
      console.warn('[API Service] Backend returned empty data set. Using fallback products catalog.');
      return PRODUCTS;
    }
  } catch (error) {
    console.warn('[API Service] Could not connect to Express Backend at /api/data. Using client fallback data.', error.message);
    return PRODUCTS;
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
      return json.data.map(cat => ({
        id: (cat.slug || cat.name || String(cat.category_id)).toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        category_id: cat.category_id,
        name: cat.name || 'Category',
        shortName: cat.name || 'Category',
        description: cat.description || 'Sacred 925 & 999 Pure Silver Items',
        idealFor: cat.ideal_for || 'All',
        image_id: cat.image_id || null,
        image_url: cat.image_url || null,
        image: cat.image_url || null
      }));
    }
  } catch (err) {
    console.warn('[API Service] Category fetch warning:', err);
  }
  return null;
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
    const response = await fetch(`${API_BASE_URL}/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
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

