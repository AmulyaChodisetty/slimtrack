import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const NOTIF_KEY = 'slimtrack_notifications';

const defaultSettings = {
  enabled: false,
  time: '09:00',
  message: "Don't forget to log today! 🌸",
};

export default function NotificationSetup() {
  const { theme, colors } = useTheme();
  const [settings, setSettings] = useState(() =>
    JSON.parse(localStorage.getItem(NOTIF_KEY) || JSON.stringify(defaultSettings))
  );
  const [permission, setPermission] = useState(Notification.permission);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!settings.enabled) return;
    const schedule = () => {
      const [h, m] = settings.time.split(':').map(Number);
      const now = new Date();
      const next = new Date();
      next.setHours(h, m, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      const delay = next - now;
      return setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification('SlimTrack 🌸', {
            body: settings.message,
            icon: '/favicon.ico',
          });
        }
        schedule();
      }, delay);
    };
    const timer = schedule();
    return () => clearTimeout(timer);
  }, [settings]);

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      const updated = { ...settings, enabled: true };
      setSettings(updated);
      localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
    }
  };

  const save = (updates) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('SlimTrack 🌸', { body: settings.message, icon: '/favicon.ico' });
    }
  };

  const inputStyle = {
    padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${theme.primaryLight}`,
    fontSize: 13, fontFamily: 'Nunito, sans-serif', color: colors.text,
    background: colors.bg, outline: 'none',
  };

  return (
    <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.primaryLight}` }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: theme.primary, marginBottom: 16 }}>🔔 Daily Reminders</div>

      {permission === 'denied' && (
        <div style={{ background: '#fee2e2', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#ef4444', fontWeight: 600, marginBottom: 14 }}>
          ⚠️ Notifications are blocked. Enable them in your browser settings.
        </div>
      )}

      {permission !== 'granted' && permission !== 'denied' && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: colors.textLight, marginBottom: 10 }}>
            Get a daily reminder to log your progress. Never miss a day!
          </div>
          <button onClick={requestPermission} style={{
            padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
            fontWeight: 800, fontSize: 13, fontFamily: 'Nunito, sans-serif',
            background: `linear-gradient(135deg, ${theme.primaryMid}, ${theme.primary})`, color: '#fff',
          }}>
            🔔 Enable Notifications
          </button>
        </div>
      )}

      {permission === 'granted' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: colors.bg, borderRadius: 12, padding: '12px 16px' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>Daily Reminder</div>
              <div style={{ fontSize: 11, color: colors.textLight }}>Remind me to log every day</div>
            </div>
            <div onClick={() => save({ enabled: !settings.enabled })} style={{
              width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
              background: settings.enabled ? theme.primary : colors.border,
              position: 'relative', transition: 'background 0.3s', flexShrink: 0,
            }}>
              <div style={{
                position: 'absolute', top: 2,
                left: settings.enabled ? 22 : 2,
                width: 20, height: 20, borderRadius: '50%',
                background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                transition: 'left 0.3s',
              }} />
            </div>
          </div>

          {settings.enabled && (
            <>
              {/* Time picker */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textLight, marginBottom: 6 }}>Reminder Time</label>
                  <input type="time" value={settings.time} onChange={e => save({ time: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: colors.textLight, marginBottom: 6 }}>Message</label>
                  <input type="text" value={settings.message} onChange={e => save({ message: e.target.value })}
                    style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={testNotification} style={{
                  flex: 1, padding: '10px', borderRadius: 12, border: `1.5px solid ${theme.primaryMid}`,
                  background: theme.primaryLight, color: theme.primary, fontWeight: 700, fontSize: 12,
                  cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
                }}>
                  🔔 Test Notification
                </button>
                {saved && (
                  <div style={{ flex: 1, padding: '10px', borderRadius: 12, background: theme.accent2Light, color: theme.accent2, fontWeight: 700, fontSize: 12, textAlign: 'center' }}>
                    ✅ Saved!
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
