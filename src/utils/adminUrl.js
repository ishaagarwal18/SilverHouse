/** In-app React Admin Studio route (src/admin). */
export const ADMIN_ROUTE = '/admin';

/**
 * Resolves the admin portal URL. Defaults to the in-app React Admin Studio;
 * set VITE_ADMIN_URL to point at an externally hosted admin instead.
 */
export function getAdminUrl() {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ADMIN_URL) {
    return import.meta.env.VITE_ADMIN_URL;
  }
  return ADMIN_ROUTE;
}
