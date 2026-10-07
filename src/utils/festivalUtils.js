/**
 * Utility functions to calculate active festivals by start_date & end_date,
 * and prioritize products belonging to active festival categories.
 */

/**
 * Normalizes a date string or object to a JS Date set at start-of-day (00:00:00).
 */
export function normalizeDate(val) {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Checks if a reference date (default: today) falls within a festival's start_date and end_date.
 */
export function isFestivalActive(festival, referenceDate = new Date()) {
  if (!festival) return false;
  const ref = normalizeDate(referenceDate);
  if (!ref) return false;

  const start = normalizeDate(festival.start_date);
  const end = normalizeDate(festival.end_date);

  // If end_date is set, set it to end-of-day (23:59:59)
  let endMax = null;
  if (end) {
    endMax = new Date(end);
    endMax.setHours(23, 59, 59, 999);
  }

  if (start && endMax) {
    return ref >= start && ref <= endMax;
  }
  if (start) {
    return ref >= start;
  }
  if (endMax) {
    return ref <= endMax;
  }
  return false;
}

/**
 * Returns all active festivals from a list based on reference date.
 */
export function getActiveFestivals(festivals = [], referenceDate = new Date()) {
  if (!Array.isArray(festivals)) return [];
  return festivals.filter(f => isFestivalActive(f, referenceDate));
}

/**
 * Returns a Set of category_id values linked to active festivals.
 */
export function getActiveCategoryIds(activeFestivals = [], festivalCategories = []) {
  const activeIds = new Set();
  const activeFestIds = new Set(activeFestivals.map(f => String(f.id)));

  // Add direct category_id on festival records
  activeFestivals.forEach(f => {
    if (f.category_id) activeIds.add(Number(f.category_id));
  });

  // Add mapped category_ids from festival_category table
  if (Array.isArray(festivalCategories)) {
    festivalCategories.forEach(fc => {
      if (activeFestIds.has(String(fc.festival_id)) && fc.category_id) {
        activeIds.add(Number(fc.category_id));
      }
    });
  }

  return activeIds;
}

/**
 * Reorders product list so products belonging to active festival categories appear FIRST.
 */
export function prioritizeProductsByActiveFestivals(products = [], festivals = [], festivalCategories = [], referenceDate = new Date()) {
  if (!Array.isArray(products) || products.length === 0) return [];
  
  const activeFestivals = getActiveFestivals(festivals, referenceDate);
  if (activeFestivals.length === 0) return products;

  const activeCategoryIds = getActiveCategoryIds(activeFestivals, festivalCategories);
  if (activeCategoryIds.size === 0) return products;

  const prioritized = [];
  const regular = [];

  products.forEach(p => {
    const catId = Number(p.category_id || p.categoryId);
    if (activeCategoryIds.has(catId)) {
      prioritized.push({ ...p, isFestivalPriority: true });
    } else {
      regular.push(p);
    }
  });

  return [...prioritized, ...regular];
}
