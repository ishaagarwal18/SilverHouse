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
 * Returns all active festivals from a list based on reference date, sorted by start_date.
 */
export function getActiveFestivals(festivals = [], referenceDate = new Date()) {
  if (!Array.isArray(festivals)) return [];
  const active = festivals.filter(f => isFestivalActive(f, referenceDate));

  active.sort((a, b) => {
    const da = normalizeDate(a.start_date) || new Date(0);
    const db = normalizeDate(b.start_date) || new Date(0);
    return da - db;
  });

  return active;
}

/**
 * Determines the single primary festival to display in the Festival Section.
 * Priority 1: Currently active festival based on start_date and end_date (today falls within range).
 * Priority 2: Next upcoming festival (start_date >= today), sorted by earliest start_date.
 * Priority 3: Nearest festival by start_date.
 */
export function getDisplayedFestival(festivals = [], referenceDate = new Date()) {
  if (!Array.isArray(festivals) || festivals.length === 0) return null;
  const ref = normalizeDate(referenceDate) || normalizeDate(new Date());

  // 1. Active festival today
  const active = getActiveFestivals(festivals, ref);
  if (active.length > 0) return active[0];

  // 2. Next upcoming festival
  const upcoming = festivals
    .filter(f => {
      const start = normalizeDate(f.start_date);
      return start && start >= ref;
    })
    .sort((a, b) => {
      const da = normalizeDate(a.start_date);
      const db = normalizeDate(b.start_date);
      return da - db;
    });

  if (upcoming.length > 0) return upcoming[0];

  // 3. Fallback
  const sorted = [...festivals].sort((a, b) => {
    const da = normalizeDate(a.start_date) || new Date(0);
    const db = normalizeDate(b.start_date) || new Date(0);
    return da - db;
  });

  return sorted[0] || null;
}

/**
 * Returns a Set of category_id values linked to active festivals or a specific festival.
 */
export function getActiveCategoryIds(activeFestivals = [], festivalCategories = [], categories = []) {
  const activeIds = new Set();
  const targetFestivals = Array.isArray(activeFestivals) ? activeFestivals : [activeFestivals];
  const activeFestIds = new Set(targetFestivals.map(f => String(f.id)));

  const catNameToIdMap = new Map();
  if (Array.isArray(categories)) {
    categories.forEach(c => {
      const cId = Number(c.category_id || c.id);
      if (!isNaN(cId)) {
        if (c.name) catNameToIdMap.set(String(c.name).toLowerCase().trim(), cId);
        if (c.slug) catNameToIdMap.set(String(c.slug).toLowerCase().trim(), cId);
      }
    });
  }

  // Add primary_website_category from festival records if present
  targetFestivals.forEach(f => {
    if (f && f.primary_website_category) {
      const mapped = catNameToIdMap.get(String(f.primary_website_category).toLowerCase().trim());
      if (mapped !== undefined) activeIds.add(mapped);
    }
  });

  // Add mapped category_ids from festival_category table
  if (Array.isArray(festivalCategories)) {
    festivalCategories.forEach(fc => {
      if (activeFestIds.has(String(fc.festival_id)) && fc.category_id) {
        const numId = Number(fc.category_id);
        if (!isNaN(numId)) {
          activeIds.add(numId);
        } else {
          const mapped = catNameToIdMap.get(String(fc.category_id).toLowerCase().trim());
          if (mapped !== undefined) activeIds.add(mapped);
        }
      }
    });
  }

  return activeIds;
}

/**
 * Reorders product list so products belonging to active festival categories appear FIRST.
 */
export function prioritizeProductsByActiveFestivals(products = [], festivals = [], festivalCategories = [], referenceDate = new Date(), categories = []) {
  if (!Array.isArray(products) || products.length === 0) return [];
  
  const activeFestivals = getActiveFestivals(festivals, referenceDate);
  if (activeFestivals.length === 0) return products;

  const activeCategoryIds = getActiveCategoryIds(activeFestivals, festivalCategories, categories);
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

