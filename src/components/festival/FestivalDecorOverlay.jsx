import React, { useState, useEffect } from 'react';
import NavratriFestivalDecor from './NavratriFestivalDecor';
import DiwaliFestivalDecor from './DiwaliFestivalDecor';
import ChristmasFestivalDecor from './ChristmasFestivalDecor';
import KarwaChauthFestivalDecor from './KarwaChauthFestivalDecor';

/**
 * Available Festival Themes
 */
export const FESTIVAL_THEMES = [
  { id: 'karwachauth', name: 'Shubh Karwa Chauth', icon: '🌙', description: 'Chhalni & Moon, Sacred Silver Karwa, Red Rose Toran & Saubhagya Keepsakes' },
  { id: 'diwali', name: 'Shubh Deepavali Mahotsav', icon: '🪔', description: 'Kamakshi Deepam, Lakshmi Charan, Golden Fuljadi & Toran Lights' },
  { id: 'christmas', name: 'Merry Christmas & New Year', icon: '🎄', description: 'Winter Pine Garland, Ambient Snowfall, Santa & Silver Holiday Magic' },
  { id: 'navratri', name: 'Navratri Garba Mahotsav', icon: '🥁', description: 'Dandiya Sticks, Marigold Toran Garland & Garba Dancers' },
  { id: 'none', name: 'Standard Store Theme', icon: '✨', description: 'Classic Silver House Elegance' }
];

export const getActiveFestivalTheme = (activeFestivalName) => {
  try {
    const saved = localStorage.getItem('silverhouse_active_festival_theme');
    if (saved && (saved === 'karwachauth' || saved === 'christmas' || saved === 'diwali' || saved === 'none')) {
      return saved;
    }
    // Default to active Karwa Chauth festival mode
    localStorage.setItem('silverhouse_active_festival_theme', 'karwachauth');
    return 'karwachauth';
  } catch {
    // Fallback
  }
  return 'karwachauth';
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
      {activeTheme === 'karwachauth' && (
        <KarwaChauthFestivalDecor onNavigateToFestival={onNavigateToFestival} />
      )}

      {activeTheme === 'christmas' && (
        <ChristmasFestivalDecor onNavigateToFestival={onNavigateToFestival} />
      )}

      {activeTheme === 'diwali' && (
        <DiwaliFestivalDecor onNavigateToFestival={onNavigateToFestival} />
      )}

      {activeTheme === 'navratri' && (
        <NavratriFestivalDecor onNavigateToFestival={onNavigateToFestival} />
      )}
    </>
  );
}
