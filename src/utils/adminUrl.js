/** In-app React Admin Studio route (src/admin). */
export const ADMIN_ROUTE = '/admin';

/**
 * Resolves the admin portal URL. Defaults to /admin or VITE_ADMIN_URL.
 */
export function getAdminUrl() {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ADMIN_URL) {
    return import.meta.env.VITE_ADMIN_URL;
  }
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return `${window.location.origin}/admin`;
  }
  return 'https://silverhouseindia.com/admin';
}
