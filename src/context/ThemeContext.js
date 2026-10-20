import React, { createContext, useContext, useState, useEffect } from 'react';

const themes = {
  rose: {
    name: 'Rose Pink', emoji: '🌸',
    primary: '#ec4899', primaryLight: '#fce7f3', primaryMid: '#f9a8d4',
    secondary: '#7c3aed', secondaryLight: '#ede9fe', secondaryMid: '#c4b5fd',
    accent1: '#ea580c', accent1Light: '#ffedd5', accent1Mid: '#fdba74',
    accent2: '#059669', accent2Light: '#d1fae5', accent2Mid: '#6ee7b7',
    accent3: '#2563eb', accent3Light: '#dbeafe', accent3Mid: '#93c5fd',
    accent4: '#ca8a04', accent4Light: '#fef9c3', accent4Mid: '#fde68a',
  },
  peach: {
    name: 'Peach Sunset', emoji: '🍑',
    primary: '#f97316', primaryLight: '#fff7ed', primaryMid: '#fed7aa',
    secondary: '#db2777', secondaryLight: '#fdf2f8', secondaryMid: '#fbcfe8',
    accent1: '#7c3aed', accent1Light: '#ede9fe', accent1Mid: '#c4b5fd',
    accent2: '#059669', accent2Light: '#d1fae5', accent2Mid: '#6ee7b7',
    accent3: '#0284c7', accent3Light: '#e0f2fe', accent3Mid: '#7dd3fc',
    accent4: '#ca8a04', accent4Light: '#fef9c3', accent4Mid: '#fde68a',
  },
  mint: {
    name: 'Mint Fresh', emoji: '🌿',
    primary: '#059669', primaryLight: '#d1fae5', primaryMid: '#6ee7b7',
    secondary: '#0284c7', secondaryLight: '#e0f2fe', secondaryMid: '#7dd3fc',
    accent1: '#ec4899', accent1Light: '#fce7f3', accent1Mid: '#f9a8d4',
    accent2: '#7c3aed', accent2Light: '#ede9fe', accent2Mid: '#c4b5fd',
    accent3: '#ea580c', accent3Light: '#ffedd5', accent3Mid: '#fdba74',
    accent4: '#ca8a04', accent4Light: '#fef9c3', accent4Mid: '#fde68a',
  },
  lavender: {
    name: 'Lavender Dream', emoji: '💜',
    primary: '#7c3aed', primaryLight: '#ede9fe', primaryMid: '#c4b5fd',
    secondary: '#db2777', secondaryLight: '#fdf2f8', secondaryMid: '#fbcfe8',
    accent1: '#0284c7', accent1Light: '#e0f2fe', accent1Mid: '#7dd3fc',
    accent2: '#059669', accent2Light: '#d1fae5', accent2Mid: '#6ee7b7',
    accent3: '#ea580c', accent3Light: '#ffedd5', accent3Mid: '#fdba74',
    accent4: '#ca8a04', accent4Light: '#fef9c3', accent4Mid: '#fde68a',
  },
  sky: {
    name: 'Sky Blue', emoji: '🩵',
    primary: '#0284c7', primaryLight: '#e0f2fe', primaryMid: '#7dd3fc',
    secondary: '#7c3aed', secondaryLight: '#ede9fe', secondaryMid: '#c4b5fd',
    accent1: '#ec4899', accent1Light: '#fce7f3', accent1Mid: '#f9a8d4',
    accent2: '#059669', accent2Light: '#d1fae5', accent2Mid: '#6ee7b7',
    accent3: '#ea580c', accent3Light: '#ffedd5', accent3Mid: '#fdba74',
    accent4: '#ca8a04', accent4Light: '#fef9c3', accent4Mid: '#fde68a',
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(() => localStorage.getItem('st_theme') || 'rose');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('st_dark') === 'true');

  const theme = themes[themeName];

  useEffect(() => { localStorage.setItem('st_theme', themeName); }, [themeName]);
  useEffect(() => { localStorage.setItem('st_dark', darkMode); }, [darkMode]);

  const dark = {
    bg: '#1a1025', card: '#241832', border: '#3d2a52',
    text: '#f0e6ff', textLight: '#9ca3af', sidebar: '#1e1530',
  };
  const light = {
    bg: '#fdf6ff', card: '#ffffff', border: '#f3e8ff',
    text: '#4a4063', textLight: '#9ca3af', sidebar: '#ffffff',
  };

  const colors = darkMode ? dark : light;

  return (
    <ThemeContext.Provider value={{ theme, themes, themeName, setThemeName, darkMode, setDarkMode, colors }}>
      <div style={{
        '--bg': colors.bg, '--card': colors.card, '--border': colors.border,
        '--text': colors.text, '--text-light': colors.textLight,
        '--primary': theme.primary, '--primary-light': theme.primaryLight, '--primary-mid': theme.primaryMid,
        background: colors.bg, color: colors.text, minHeight: '100vh',
        transition: 'background 0.3s, color 0.3s',
      }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
export { themes };
