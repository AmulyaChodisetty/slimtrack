import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemePicker from './ThemePicker';

const navItems = [
  { path: '/', icon: '🏠', label: 'Dashboard' },
  { path: '/log', icon: '📝', label: 'Log Day' },
  { path: '/weight', icon: '⚖️', label: 'Weight' },
  { path: '/calories', icon: '🔥', label: 'Calories' },
  { path: '/steps', icon: '👟', label: 'Steps' },
  { path: '/progress', icon: '📊', label: 'Progress' },
  { path: '/goals', icon: '🎯', label: 'Goals' },
];

const avatarColors = ['#f9a8d4', '#c4b5fd', '#93c5fd', '#6ee7b7', '#fdba74'];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, colors } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const profileRef = useRef(null);
  const themeRef = useRef(null);

  const current = navItems.find(n => n.path === location.pathname)
    || (location.pathname === '/profile' ? { icon: '👤', label: 'Profile' } : null);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const avatarBg = avatarColors[(user?.id || 0) % avatarColors.length];

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (themeRef.current && !themeRef.current.contains(e.target)) setThemeOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.bg }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: colors.sidebar,
        borderRight: `1.5px solid ${colors.border}`,
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
        transition: 'background 0.3s',
      }} className="sidebar">
        <div style={{ padding: '22px 20px 18px', borderBottom: `1.5px solid ${colors.border}` }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: theme.primary }}>🌸 SlimTrack</div>
          <div style={{ fontSize: 12, color: colors.textLight, marginTop: 2 }}>Your wellness companion</div>
        </div>

        <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 14,
                textDecoration: 'none', fontWeight: 600, fontSize: 14,
                background: isActive ? theme.primaryLight : 'transparent',
                color: isActive ? theme.primary : colors.textLight,
                transition: 'all 0.2s',
              })}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', fontSize: 11, color: theme.secondaryMid, fontWeight: 600 }}>
          Made with 💜 for you
        </div>
      </aside>

      {/* Right side */}
      <div style={{ flex: 1, marginLeft: 220, display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="main-wrapper">

        {/* Top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: colors.card, borderBottom: `1.5px solid ${colors.border}`,
          padding: '12px 28px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          transition: 'background 0.3s',
        }} className="topbar">
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: colors.text }}>
              {current?.icon} {current?.label}
            </div>
            <div style={{ fontSize: 12, color: colors.textLight, marginTop: 1 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Theme picker button */}
            <div ref={themeRef} style={{ position: 'relative' }}>
              <button onClick={() => { setThemeOpen(p => !p); setProfileOpen(false); }} style={{
                width: 38, height: 38, borderRadius: 12, border: `1.5px solid ${colors.border}`,
                background: themeOpen ? theme.primaryLight : colors.bg,
                cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                🎨
              </button>
              <AnimatePresence>
                {themeOpen && <ThemePicker onClose={() => setThemeOpen(false)} />}
              </AnimatePresence>
            </div>

            {/* Profile button */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button onClick={() => { setProfileOpen(p => !p); setThemeOpen(false); }} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: profileOpen ? theme.primaryLight : colors.bg,
                border: `1.5px solid ${colors.border}`, borderRadius: 14,
                padding: '8px 14px', cursor: 'pointer', transition: 'all 0.2s',
              }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>
                  {initials}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>{user?.name}</div>
                  <div style={{ fontSize: 10, color: colors.textLight }}>{user?.email}</div>
                </div>
                <span style={{ fontSize: 12, color: colors.textLight, marginLeft: 4, transition: 'transform 0.2s', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>▼</span>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: colors.card, borderRadius: 16, border: `1.5px solid ${colors.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', minWidth: 200, overflow: 'hidden', zIndex: 200 }}>
                    <div style={{ padding: '14px 16px', borderBottom: `1.5px solid ${colors.border}`, background: colors.bg }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff' }}>{initials}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>{user?.name}</div>
                          <div style={{ fontSize: 11, color: colors.textLight }}>{user?.email}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '8px' }}>
                      <button onClick={() => { setProfileOpen(false); navigate('/profile'); }} style={{ ...menuItemStyle(colors) }}>
                        <span>👤</span> View Profile
                      </button>
                      <div style={{ height: 1, background: colors.border, margin: '6px 0' }} />
                      <button onClick={() => { setProfileOpen(false); logout(); }} style={{ ...menuItemStyle(colors), color: '#ef4444' }}>
                        <span>🚪</span> Logout
                      </button>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px 28px 100px' }} className="main-content">
          {children}
        </main>
      </div>

      {/* Bottom nav mobile */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: colors.card, borderTop: `1.5px solid ${colors.border}`,
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        height: 64, zIndex: 200, padding: '0 2px',
      }} className="bottom-nav">
        {[...navItems, { path: '/profile', icon: '👤', label: 'Profile' }].map(item => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 2, textDecoration: 'none', padding: '6px 6px', borderRadius: 12,
              background: isActive ? theme.primaryLight : 'transparent', minWidth: 36,
            })}>
            {({ isActive }) => (
              <>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ fontSize: 8, fontWeight: 700, color: isActive ? theme.primary : colors.textLight }}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .main-wrapper { margin-left: 0 !important; }
          .main-content { padding: 16px 16px 80px !important; }
          .topbar { padding: 10px 16px !important; }
        }
        @media (min-width: 769px) {
          .bottom-nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}

const menuItemStyle = (colors) => ({
  display: 'flex', alignItems: 'center', gap: 10,
  width: '100%', padding: '10px 12px', borderRadius: 10,
  border: 'none', background: 'transparent', cursor: 'pointer',
  fontSize: 13, fontWeight: 700, color: colors.text,
  fontFamily: 'Nunito, sans-serif', textAlign: 'left',
});
