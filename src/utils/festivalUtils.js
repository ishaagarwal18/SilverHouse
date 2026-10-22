/**
 * Utility functions to calculate active festivals by start_date & end_date,
 * and prioritize products belonging to active festival categories.
 */

/**
 * Parses a date value (string or Date) into a calendar-local Date set at 00:00:00.
 * Eliminates UTC timezone shifts on "YYYY-MM-DD" and ISO strings.
 */
export function parseLocalDate(val) {
  if (!val) return null;
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    return new Date(val.getFullYear(), val.getMonth(), val.getDate(), 0, 0, 0, 0);
  }
  const str = String(val).trim();
  // Match YYYY-MM-DD pattern at beginning
  const match = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    const y = parseInt(match[1], 10);
    const m = parseInt(match[2], 10) - 1;
    const d = parseInt(match[3], 10);
    return new Date(y, m, d, 0, 0, 0, 0);
  }
  const parsed = new Date(val);
  if (isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0, 0);
}

// Backwards-compatible alias for parseLocalDate
export const normalizeDate = parseLocalDate;

/**
 * Checks if a reference date (default: today) falls within a festival's start_date and end_date (inclusive).
 */
export function isFestivalActive(festival, referenceDate = new Date()) {
  if (!festival) return false;
  const ref = parseLocalDate(referenceDate);
  if (!ref) return false;

  const start = parseLocalDate(festival.start_date);
  const end = parseLocalDate(festival.end_date);

  if (start && end) {
    return ref.getTime() >= start.getTime() && ref.getTime() <= end.getTime();
  }
  if (start) {
    return ref.getTime() >= start.getTime();
  }
  if (end) {
    return ref.getTime() <= end.getTime();
  }
  return false;
}

/**
 * Formats start_date and end_date into an intuitive, localized date range string.
 * e.g. "20 – 22 Oct 2026", "22 Oct – 14 Nov 2026", "12 Oct 2026".
 */
export function formatFestivalDateRange(startDate, endDate) {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  if (!start && !end) return '';
  if (start && !end) {
    return start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  if (!start && end) {
    return `Until ${end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }

  // Single day festival
  if (start.getTime() === end.getTime()) {
    return start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const sDay = start.getDate();
  const eDay = end.getDate();
  const sMonth = start.toLocaleDateString('en-IN', { month: 'short' });
  const eMonth = end.toLocaleDateString('en-IN', { month: 'short' });
  const sYear = start.getFullYear();
  const eYear = end.getFullYear();

  if (sYear === eYear) {
    if (sMonth === eMonth) {
      return `${sDay} – ${eDay} ${sMonth} ${sYear}`;
    }
    return `${sDay} ${sMonth} – ${eDay} ${eMonth} ${sYear}`;
  }
  return `${sDay} ${sMonth} ${sYear} – ${eDay} ${eMonth} ${eYear}`;
}

/**
 * Returns all active festivals from a list based on reference date, sorted by start_date.
 */
export function getActiveFestivals(festivals = [], referenceDate = new Date()) {
  if (!Array.isArray(festivals)) return [];
  const ref = parseLocalDate(referenceDate) || parseLocalDate(new Date());
  const active = festivals.filter(f => isFestivalActive(f, ref));

  // Sort active festivals:
  // Festivals starting closest to today first, or longest remaining duration
  active.sort((a, b) => {
    const da = parseLocalDate(a.start_date) || new Date(0);
    const db = parseLocalDate(b.start_date) || new Date(0);
    if (db.getTime() !== da.getTime()) {
      return db.getTime() - da.getTime();
    }
    const ea = parseLocalDate(a.end_date) || new Date(0);
    const eb = parseLocalDate(b.end_date) || new Date(0);
    return eb.getTime() - ea.getTime();
  });

  return active;
}

/**
 * Determines the single primary festival to display in the Festival Section.
 * Priority 1: Currently active festival based on start_date and end_date (today falls within range).
 * Priority 2: Next upcoming festival (start_date >= today), sorted by earliest start_date.
 * Priority 3: Nearest festival by end_date.
 */
export function getDisplayedFestival(festivals = [], referenceDate = new Date()) {
  if (!Array.isArray(festivals) || festivals.length === 0) return null;
  const ref = parseLocalDate(referenceDate) || parseLocalDate(new Date());

  // 1. Active festival today
  const active = getActiveFestivals(festivals, ref);
  if (active.length > 0) return active[0];

  // 2. Next upcoming festival
  const upcoming = festivals
    .filter(f => {
      const start = parseLocalDate(f.start_date);
      return start && start.getTime() > ref.getTime();
    })
    .sort((a, b) => {
      const da = parseLocalDate(a.start_date);
      const db = parseLocalDate(b.start_date);
      return da.getTime() - db.getTime();
    });

  if (upcoming.length > 0) return upcoming[0];

  // 3. Most recent concluded festival
  const past = festivals
    .filter(f => {
      const end = parseLocalDate(f.end_date);
      return end && end.getTime() < ref.getTime();
    })
    .sort((a, b) => {
      const ea = parseLocalDate(a.end_date);
      const eb = parseLocalDate(b.end_date);
      return eb.getTime() - ea.getTime();
    });

  if (past.length > 0) return past[0];

  return festivals[0] || null;
}

/**
 * Returns a Set of numeric category_id values linked to active festivals or a specific festival
 * strictly through the festival_category mapping table.
 */
export function getActiveCategoryIds(activeFestivals = [], festivalCategories = [], categories = []) {
  const activeIds = new Set();
  const targetFestivals = Array.isArray(activeFestivals) ? activeFestivals : [activeFestivals];
  const activeFestIds = new Set(
    targetFestivals
      .filter(Boolean)
      .map(f => String(f.id || f.festival_id || '').trim().toLowerCase())
      .filter(Boolean)
  );

  const catNameToIdMap = new Map();
  if (Array.isArray(categories)) {
    categories.forEach(c => {
      if (!c) return;
      const cId = Number(c.category_id || c.id);
      if (!isNaN(cId) && cId > 0) {
        if (c.name) catNameToIdMap.set(String(c.name).toLowerCase().trim(), cId);
        if (c.slug) catNameToIdMap.set(String(c.slug).toLowerCase().trim(), cId);
      }
    });
  }

  // Add mapped category_ids from festival_category table
  if (Array.isArray(festivalCategories)) {
    festivalCategories.forEach(fc => {
      if (!fc) return;
      const festId = String(fc.festival_id || '').trim().toLowerCase();
      if (activeFestIds.has(festId)) {
        const numId = Number(fc.category_id);
        if (!isNaN(numId) && numId > 0) {
          activeIds.add(numId);
        } else if (fc.category_id) {
          const mapped = catNameToIdMap.get(String(fc.category_id).toLowerCase().trim());
          if (mapped !== undefined) activeIds.add(mapped);
        }
        if (fc.category_name) {
          const mapped = catNameToIdMap.get(String(fc.category_name).toLowerCase().trim());
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
  
  let refDate = referenceDate;
  let cats = categories;
  if (Array.isArray(referenceDate)) {
    cats = referenceDate;
    refDate = new Date();
  }

  const activeFestivals = getActiveFestivals(festivals, refDate);
  if (activeFestivals.length === 0) return products;

  const activeCategoryIds = getActiveCategoryIds(activeFestivals, festivalCategories, cats);
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

