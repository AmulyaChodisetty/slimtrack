import React from 'react';
import { useTheme, themes } from '../context/ThemeContext';
import { motion } from 'framer-motion';

export default function ThemePicker({ onClose }) {
  const { themeName, setThemeName, darkMode, setDarkMode, colors, theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
        background: colors.card, borderRadius: 20, border: `1.5px solid ${colors.border}`,
        boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
        padding: 20, minWidth: 260, zIndex: 300,
      }}
    >
      {/* Dark mode toggle */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: colors.textLight, marginBottom: 10 }}>APPEARANCE</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: colors.bg, borderRadius: 12, padding: '10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>{darkMode ? '🌙' : '☀️'}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <div onClick={() => setDarkMode(p => !p)} style={{
            width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
            background: darkMode ? theme.primary : '#e5e7eb',
            position: 'relative', transition: 'background 0.3s',
          }}>
            <motion.div
              animate={{ x: darkMode ? 22 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              style={{ position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
            />
          </div>
        </div>
      </div>

      {/* Theme picker */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: colors.textLight, marginBottom: 10 }}>THEME</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.entries(themes).map(([key, t]) => (
            <div key={key} onClick={() => { setThemeName(key); }} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
              background: themeName === key ? t.primaryLight : colors.bg,
              border: `1.5px solid ${themeName === key ? t.primaryMid : 'transparent'}`,
              transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: 20 }}>{t.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: themeName === key ? t.primary : colors.text }}>{t.name}</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                {[t.primary, t.secondaryMid, t.accent1Mid, t.accent2Mid].map((c, i) => (
                  <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
                ))}
              </div>
              {themeName === key && <span style={{ fontSize: 14, color: t.primary }}>✓</span>}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
