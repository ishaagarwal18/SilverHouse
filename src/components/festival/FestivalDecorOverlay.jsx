import React, { useState, useEffect } from 'react';
import NavratriFestivalDecor from './NavratriFestivalDecor';

/**
 * Available Festival Themes
 */
export const FESTIVAL_THEMES = [
  { id: 'navratri', name: 'Navratri Garba Mahotsav', icon: '🪔', description: 'Dandiya Sticks, Marigold Toran Garland, Garbo Diya & 9-Days Color Banner' },
  { id: 'diwali', name: 'Diwali Deepavali (Upcoming)', icon: '🪔', description: 'Sparkling Fuljadi, Firecrackers, Diya Flame & Rangoli Decor' },
  { id: 'none', name: 'Standard Store Theme', icon: '✨', description: 'Classic Silver House Elegance' }
];

export const getActiveFestivalTheme = (activeFestivalName) => {
  try {
    const saved = localStorage.getItem('silverhouse_active_festival_theme');
    if (saved) return saved;
  } catch {
    // Fallback
  }
  if (activeFestivalName && activeFestivalName.toLowerCase().includes('navratri')) {
    return 'navratri';
  }
  return 'navratri';
};

export const setFestivalTheme = (themeId) => {
  try {
    localStorage.setItem('silverhouse_active_festival_theme', themeId);
    window.dispatchEvent(new CustomEvent('silverhouse_festival_theme_updated', { detail: { themeId } }));
  } catch (e) {
    console.warn(e);
  }
};

export default function FestivalDecorOverlay({ activeFestivalName, onNavigateToFestival }) {
  const [activeTheme, setActiveTheme] = useState(() => getActiveFestivalTheme(activeFestivalName));

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail?.themeId) {
        setActiveTheme(e.detail.themeId);
      } else {
        setActiveTheme(getActiveFestivalTheme(activeFestivalName));
      }
    };
    window.addEventListener('silverhouse_festival_theme_updated', handleUpdate);
    return () => window.removeEventListener('silverhouse_festival_theme_updated', handleUpdate);
  }, [activeFestivalName]);

  return (
    <>
      {/* RENDER ACTIVE FESTIVAL COMPONENT SUITE */}
      {activeTheme === 'navratri' && (
        <NavratriFestivalDecor onNavigateToFestival={onNavigateToFestival} />
      )}

      {activeTheme === 'diwali' && (
        <div className="w-full bg-gradient-to-r from-amber-600 via-red-600 to-amber-600 text-white text-xs font-bold py-2 px-4 text-center select-none shadow-md">
          🪔 Diwali Festival Mode Preview • Diya Lights & Rangoli Active
        </div>
      )}
    </>
  );
}
