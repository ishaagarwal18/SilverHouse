import React, { useState, useEffect } from 'react';
import NavratriFestivalDecor from './NavratriFestivalDecor';
import DiwaliFestivalDecor from './DiwaliFestivalDecor';
import ChristmasFestivalDecor from './ChristmasFestivalDecor';
import KarwaChauthFestivalDecor from './KarwaChauthFestivalDecor';
import GaneshChaturthiDecor from './GaneshChaturthiDecor';
import NewYearFestivalDecor from './NewYearFestivalDecor';
import ValentineFestivalDecor from './ValentineFestivalDecor';

/**
 * Available Festival Themes
 */
export const FESTIVAL_THEMES = [
  { id: 'valentines', name: "Valentine's Day Romance", icon: '💖', description: "Love Teddy Bear, Velvet Ring Box, Blooming Roses, Floating Hearts & Love Gifts" },
  { id: 'newyear', name: 'Happy New Year 2027', icon: '✨', description: 'Midnight Clock, Clinking Flutes, Party Poppers, Confetti & Silver Keepsakes' },
  { id: 'ganeshchaturthi', name: 'Ganesh Chaturthi Mahotsav', icon: '🐘', description: 'Ganpati Bappa, Golden Modak & Mushak, Red Hibiscus Toran & Silver Murtis' },
  { id: 'karwachauth', name: 'Shubh Karwa Chauth', icon: '🌙', description: 'Chhalni & Moon, Sacred Silver Karwa, Red Rose Toran & Saubhagya Keepsakes' },
  { id: 'diwali', name: 'Shubh Deepavali Mahotsav', icon: '🪔', description: 'Kamakshi Deepam, Lakshmi Charan, Golden Fuljadi & Toran Lights' },
  { id: 'christmas', name: 'Merry Christmas Holiday', icon: '🎄', description: 'Winter Pine Garland, Ambient Snowfall, Santa & Silver Holiday Magic' },
  { id: 'navratri', name: 'Navratri Garba Mahotsav', icon: '🥁', description: 'Dandiya Sticks, Marigold Toran Garland & Garba Dancers' },
  { id: 'none', name: 'Standard Store Theme', icon: '💎', description: 'Classic Silver House Elegance' }
];

export const getActiveFestivalTheme = (activeFestivalName) => {
  try {
    const saved = localStorage.getItem('silverhouse_active_festival_theme');
    if (saved && (saved === 'valentines' || saved === 'newyear' || saved === 'ganeshchaturthi' || saved === 'karwachauth' || saved === 'christmas' || saved === 'diwali' || saved === 'navratri' || saved === 'none')) {
      return saved;
    }
    // Default to active Valentine's Day Romance mode
    localStorage.setItem('silverhouse_active_festival_theme', 'valentines');
    return 'valentines';
  } catch {
    // Fallback
  }
  return 'valentines';
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
      {activeTheme === 'valentines' && (
        <ValentineFestivalDecor onNavigateToFestival={onNavigateToFestival} />
      )}

      {activeTheme === 'newyear' && (
        <NewYearFestivalDecor onNavigateToFestival={onNavigateToFestival} />
      )}

      {activeTheme === 'ganeshchaturthi' && (
        <GaneshChaturthiDecor onNavigateToFestival={onNavigateToFestival} />
      )}

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
