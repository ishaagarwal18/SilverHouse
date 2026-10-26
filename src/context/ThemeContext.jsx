import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchStoreParameters, updateStoreParameters } from '../services/api';

export const THEMES = [
  {
    id: 'aegean',
    name: 'Aegean Sea Mist',
    vibe: 'Calm Mineral Teal',
    description: 'Refreshing cool sea mist with soothing deep oceanic mineral teal',
    preview: {
      primary: '#1F4E5B',
      bg: '#E8EFF0',
      card: '#F4F8F8',
      accent: '#B89340'
    }
  },
  {
    id: 'nordic',
    name: 'Nordic Ice Slate',
    vibe: 'Cool Dusty Denim',
    description: 'Understated Scandinavian slate grey-blue with fjord mist serenity',
    preview: {
      primary: '#2E4C6D',
      bg: '#E9ECEF',
      card: '#F6F8FA',
      accent: '#B08D57'
    }
  },
  {
    id: 'sage',
    name: 'Eucalyptus Sage',
    vibe: 'Tranquil Botanical Jade',
    description: 'Gentle dewy sage leaves with calming celadon and earthy bamboo linen',
    preview: {
      primary: '#2D5548',
      bg: '#E8ECE8',
      card: '#F5F8F5',
      accent: '#A38342'
    }
  },
  {
    id: 'lavender',
    name: 'Smoky Amethyst',
    vibe: 'Aesthetic Lilac Slate',
    description: 'Dreamy soft lavender mist paired with sophisticated smoky amethyst',
    preview: {
      primary: '#4A3E56',
      bg: '#ECE9EE',
      card: '#F8F6FA',
      accent: '#AA8238'
    }
  }
];

export function resolveWebsiteThemeId(input) {
  if (!input) return 'aegean';
  const str = String(input).trim().toLowerCase();
  if (str === 'aegean' || str.includes('aegean') || str.includes('mineral') || str.includes('teal')) return 'aegean';
  if (str === 'nordic' || str.includes('nordic') || str.includes('denim') || str.includes('slate') || str.includes('ice')) return 'nordic';
  if (str === 'sage' || str.includes('sage') || str.includes('eucalyptus') || str.includes('jade') || str.includes('celadon')) return 'sage';
  if (str === 'lavender' || str.includes('lavender') || str.includes('amethyst') || str.includes('lilac') || str.includes('violet')) return 'lavender';
  const match = THEMES.find(t => t.id === str || t.name.toLowerCase() === str);
  return match ? match.id : 'aegean';
}

function isAdminSessionActive() {
  try {
    const adminToken = localStorage.getItem('silverhouse_admin_token');
    if (adminToken) return true;
    const storeToken = localStorage.getItem('silverhouse_token');
    const storeUser = JSON.parse(localStorage.getItem('silverhouse_user') || 'null');
    return Boolean(storeToken && String(storeUser?.role).toUpperCase() === 'ADMIN');
  } catch {
    return false;
  }
}

const ThemeContext = createContext({
  theme: 'aegean',
  setTheme: () => {},
  themes: THEMES,
  currentThemeObj: THEMES[0]
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem('silverhouse_theme');
      return resolveWebsiteThemeId(saved);
    } catch {
      return 'aegean';
    }
  });

  // Apply data-theme attribute on document root whenever theme state changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync theme from database store_parameter on initial load
  useEffect(() => {
    let cancelled = false;
    async function syncBackendDefaultTheme() {
      try {
        const res = await fetchStoreParameters();
        if (!cancelled && res?.parameters?.default_theme) {
          const resolved = resolveWebsiteThemeId(res.parameters.default_theme);
          if (resolved) {
            setThemeState(resolved);
            try {
              localStorage.setItem('silverhouse_theme', resolved);
            } catch {
              // ignore
            }
          }
        }
      } catch (err) {
        console.warn('[ThemeContext] Could not sync database default_theme:', err);
      }
    }
    syncBackendDefaultTheme();
    return () => { cancelled = true; };
  }, []);

  // Sync across tabs & windows via BroadcastChannel and storage events
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'silverhouse_theme' && e.newValue) {
        const resolved = resolveWebsiteThemeId(e.newValue);
        setThemeState(resolved);
      }
    };

    const handleCustom = (e) => {
      if (e.detail?.themeId) {
        const resolved = resolveWebsiteThemeId(e.detail.themeId);
        setThemeState(resolved);
      }
    };

    let bc = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('silverhouse_website_theme_sync');
        bc.onmessage = (msg) => {
          if (msg.data?.themeId) {
            const resolved = resolveWebsiteThemeId(msg.data.themeId);
            setThemeState(resolved);
          }
        };
      }
    } catch {
      // BroadcastChannel unsupported
    }

    window.addEventListener('storage', handleStorage);
    window.addEventListener('silverhouse_website_theme_updated', handleCustom);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('silverhouse_website_theme_updated', handleCustom);
      if (bc) {
        try { bc.close(); } catch { }
      }
    };
  }, []);

  const setTheme = useCallback((newTheme) => {
    const validTheme = resolveWebsiteThemeId(newTheme);
    setThemeState(validTheme);
    try {
      localStorage.setItem('silverhouse_theme', validTheme);
      document.documentElement.setAttribute('data-theme', validTheme);
    } catch (e) {
      console.warn('Could not save theme preference:', e);
    }

    // Broadcast in current window
    try {
      window.dispatchEvent(new CustomEvent('silverhouse_website_theme_updated', { detail: { themeId: validTheme } }));
    } catch { }

    // Broadcast across other browser tabs
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('silverhouse_website_theme_sync');
        bc.postMessage({ themeId: validTheme });
        bc.close();
      }
    } catch { }

    // If caller is an Admin, immediately persist to database store_parameter so ALL screens and users adopt it
    if (isAdminSessionActive()) {
      updateStoreParameters({ default_theme: validTheme }).catch((err) => {
        console.warn('[ThemeContext] Could not persist admin default_theme:', err);
      });
    }
  }, []);

  const currentThemeObj = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES, currentThemeObj }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
