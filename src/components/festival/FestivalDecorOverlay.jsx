import React, { useState, useEffect } from 'react';
import RakshaBandhanFestivalDecor from './RakshaBandhanFestivalDecor';
import NavratriFestivalDecor from './NavratriFestivalDecor';
import DiwaliFestivalDecor from './DiwaliFestivalDecor';
import ChristmasFestivalDecor from './ChristmasFestivalDecor';
import KarwaChauthFestivalDecor from './KarwaChauthFestivalDecor';
import GaneshChaturthiDecor from './GaneshChaturthiDecor';
import NewYearFestivalDecor from './NewYearFestivalDecor';
import ValentineFestivalDecor from './ValentineFestivalDecor';
import UttarayanFestivalDecor from './UttarayanFestivalDecor';
import PatrioticFestivalDecor from './PatrioticFestivalDecor';
import HoliFestivalDecor from './HoliFestivalDecor';

/**
 * Available Festival Themes
 */
export const FESTIVAL_THEMES = [
  { id: 'rakshabandhan', name: 'Raksha Bandhan Mahotsav', icon: '🎀', description: 'Pure Silver Rakhis, Auspicious Moli, Pooja Thali, Kaju Katli & Sibling Keepsakes' },
  { id: 'holi', name: 'Holi Colors Mahotsav', icon: '🎨', description: 'Gulal Powders, Silver Pichkari, Gujiya Treats, Color Splashes & Shubh Keepsakes' },
  { id: 'patriotic', name: 'Republic & Independence Day', icon: '🇮🇳', description: 'Tiranga Flag, Amar Jawan Jyoti, Tricolor Toran & Patriotic Silver Keepsakes' },
  { id: 'uttarayan', name: 'Uttarayan & Makar Sankranti', icon: '🪁', description: 'Colorful Kites, Firki Spool, Radiant Surya Dev, Til-Gud & Silver Keepsakes' },
  { id: 'valentines', name: "Valentine's Day Romance", icon: '💖', description: "Love Teddy Bear, Velvet Ring Box, Blooming Roses, Floating Hearts & Love Gifts" },
  { id: 'newyear', name: 'Happy New Year 2027', icon: '✨', description: 'Midnight Clock, Clinking Flutes, Party Poppers, Confetti & Silver Keepsakes' },
  { id: 'ganeshchaturthi', name: 'Ganesh Chaturthi Mahotsav', icon: '🐘', description: 'Ganpati Bappa, Golden Modak & Mushak, Red Hibiscus Toran & Silver Murtis' },
  { id: 'karwachauth', name: 'Shubh Karwa Chauth', icon: '🌙', description: 'Chhalni & Moon, Sacred Silver Karwa, Red Rose Toran & Saubhagya Keepsakes' },
  { id: 'diwali', name: 'Shubh Deepavali Mahotsav', icon: '🪔', description: 'Kamakshi Deepam, Lakshmi Charan, Golden Fuljadi & Toran Lights' },
  { id: 'christmas', name: 'Merry Christmas Holiday', icon: '🎄', description: 'Winter Pine Garland, Ambient Snowfall, Santa & Silver Holiday Magic' },
  { id: 'navratri', name: 'Navratri Garba Mahotsav', icon: '🥁', description: 'Dandiya Sticks, Marigold Toran Garland & Garba Dancers' },
  { id: 'none', name: 'Standard Store Theme', icon: '💎', description: 'Classic Silver House Elegance' }
];

export const resolveFestivalThemeId = (input) => {
  if (!input) return null;
  const str = String(input).trim().toLowerCase();

  const directMatch = FESTIVAL_THEMES.find((t) => t.id === str);
  if (directMatch) return directMatch.id;

  if (str.includes('diwali') || str.includes('deepavali') || str.includes('deepam') || str.includes('dhanteras')) return 'diwali';
  if (str.includes('raksha') || str.includes('rakhi') || str.includes('bandhan')) return 'rakshabandhan';
  if (str.includes('holi') || str.includes('dhuleti') || str.includes('gulal')) return 'holi';
  if (str.includes('navratri') || str.includes('garba') || str.includes('dussehra') || str.includes('durga')) return 'navratri';
  if (str.includes('ganesh') || str.includes('ganpati') || str.includes('chaturthi')) return 'ganeshchaturthi';
  if (str.includes('karwa') || str.includes('karva')) return 'karwachauth';
  if (str.includes('uttarayan') || str.includes('sankranti') || str.includes('kite')) return 'uttarayan';
  if (str.includes('new year') || str.includes('newyear')) return 'newyear';
  if (str.includes('valentine')) return 'valentines';
  if (str.includes('christmas') || str.includes('xmas')) return 'christmas';
  if (str.includes('patriotic') || str.includes('republic') || str.includes('independence') || str.includes('tiranga')) return 'patriotic';
  if (str === 'none' || str.includes('standard') || str.includes('default')) return 'none';
  return null;
};

export const getActiveFestivalTheme = (activeFestivalName) => {
  try {
    // 1. If activeFestivalName from database is passed, it is the primary source of truth
    const resolvedFromProp = resolveFestivalThemeId(activeFestivalName);
    if (resolvedFromProp) {
      return resolvedFromProp;
    }

    // 2. Otherwise check localStorage
    const saved = localStorage.getItem('silverhouse_active_festival_theme');
    const validSaved = resolveFestivalThemeId(saved);
    if (validSaved) {
      return validSaved;
    }
  } catch {
    // Fallback
  }
  return 'diwali';
};

export const setFestivalTheme = (themeId) => {
  try {
    const validId = resolveFestivalThemeId(themeId) || 'diwali';
    localStorage.setItem('silverhouse_active_festival_theme', validId);

    // 1. Dispatch custom event in current window
    window.dispatchEvent(new CustomEvent('silverhouse_festival_theme_updated', { detail: { themeId: validId } }));

    // 2. BroadcastChannel to sync across all open browser tabs
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('silverhouse_festival_theme_sync');
        bc.postMessage({ themeId: validId });
        bc.close();
      }
    } catch {
      // Ignore broadcast channel errors
    }
  } catch (e) {
    console.warn(e);
  }
};

export default function FestivalDecorOverlay({ activeFestivalName, onNavigateToFestival }) {
  const [activeTheme, setActiveTheme] = useState(() => getActiveFestivalTheme(activeFestivalName));

  // Sync when activeFestivalName changes from API fetch
  useEffect(() => {
    if (activeFestivalName) {
      const resolved = resolveFestivalThemeId(activeFestivalName);
      if (resolved) {
        setActiveTheme(resolved);
        try {
          localStorage.setItem('silverhouse_active_festival_theme', resolved);
        } catch {
          // ignore
        }
      }
    }
  }, [activeFestivalName]);

  useEffect(() => {
    const handleUpdate = (e) => {
      const newTheme = e.detail?.themeId || getActiveFestivalTheme(activeFestivalName);
      if (newTheme) setActiveTheme(newTheme);
    };

    const handleStorage = (e) => {
      if (e.key === 'silverhouse_active_festival_theme' && e.newValue) {
        const resolved = resolveFestivalThemeId(e.newValue);
        if (resolved) setActiveTheme(resolved);
      }
    };

    let bc = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('silverhouse_festival_theme_sync');
        bc.onmessage = (event) => {
          if (event.data?.themeId) {
            setActiveTheme(event.data.themeId);
          }
        };
      }
    } catch {
      // ignore
    }

    window.addEventListener('silverhouse_festival_theme_updated', handleUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('silverhouse_festival_theme_updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
    };
  }, [activeFestivalName]);

  return (
    <>
      {/* RENDER ACTIVE FESTIVAL COMPONENT SUITE */}
      {activeTheme === 'rakshabandhan' && (
        <RakshaBandhanFestivalDecor onNavigateToFestival={onNavigateToFestival} />
      )}

      {activeTheme === 'holi' && (
        <HoliFestivalDecor onNavigateToFestival={onNavigateToFestival} />
      )}

      {activeTheme === 'patriotic' && (
        <PatrioticFestivalDecor onNavigateToFestival={onNavigateToFestival} />
      )}

      {activeTheme === 'uttarayan' && (
        <UttarayanFestivalDecor onNavigateToFestival={onNavigateToFestival} />
      )}

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
