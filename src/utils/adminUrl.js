export const DEPLOYED_ADMIN_URL = 'https://api.silverhouseindia.com/';

/**
 * Resolves the admin portal URL depending on environment and host.
 * Defaults directly to the deployed Render admin panel.
 */
export function getAdminUrl() {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ADMIN_URL) {
    return import.meta.env.VITE_ADMIN_URL;
  }
  return DEPLOYED_ADMIN_URL;
}
