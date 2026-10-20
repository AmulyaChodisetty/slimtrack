import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function InstallPrompt() {
  const { theme, colors } = useTheme();
  const [prompt, setPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => { setInstalled(true); setShow(false); });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setShow(false);
  };

  if (!show || installed) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 80, left: 16, right: 16, zIndex: 999,
      background: colors.card, borderRadius: 20, padding: '16px 20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      border: `1.5px solid ${theme.primaryMid}`,
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{ fontSize: 36, flexShrink: 0 }}>🌸</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: theme.primary }}>Install SlimTrack</div>
        <div style={{ fontSize: 12, color: colors.textLight, marginTop: 2 }}>Add to home screen for the best experience</div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={() => setShow(false)} style={{
          padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${colors.border}`,
          background: colors.bg, color: colors.textLight, fontWeight: 700, fontSize: 12,
          cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
        }}>Later</button>
        <button onClick={handleInstall} style={{
          padding: '8px 14px', borderRadius: 10, border: 'none',
          background: `linear-gradient(135deg, ${theme.primaryMid}, ${theme.primary})`,
          color: '#fff', fontWeight: 800, fontSize: 12,
          cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
        }}>Install</button>
      </div>
    </div>
  );
}
