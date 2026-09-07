import React, { createContext, useContext, useState, useEffect } from 'react';

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

const ThemeContext = createContext({
  theme: 'aegean',
  setTheme: () => {},
  themes: THEMES,
  currentThemeObj: THEMES[0]
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem('silverhouse_theme') || 'aegean';
    } catch {
      return 'aegean';
    }
  });

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('silverhouse_theme', newTheme);
    } catch (e) {
      console.warn('Could not save theme preference:', e);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
