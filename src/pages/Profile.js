import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import NotificationSetup from '../components/NotificationSetup';

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const { weightLogs, calorieLogs, stepLogs, goals } = useApp();
  const { theme, colors } = useTheme();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', age: user?.age || '', height: user?.height || '', gender: user?.gender || '' });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await updateProfile(form);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const currentWeight = weightLogs[weightLogs.length - 1]?.weight;
  const startWeight = weightLogs[0]?.weight;
  const totalLost = startWeight && currentWeight ? (startWeight - currentWeight).toFixed(1) : '—';
  const bmi = currentWeight && user?.height ? (currentWeight / Math.pow(user.height / 100, 2)).toFixed(1) : null;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 12,
    border: `1.5px solid ${theme.primaryLight}`, fontSize: 13, fontFamily: 'Nunito, sans-serif',
    color: colors.text, outline: 'none', background: colors.bg, boxSizing: 'border-box',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 600 }}>
      {/* Profile header */}
      <div style={{
        background: `linear-gradient(135deg, ${theme.primaryLight}, ${theme.secondaryLight})`,
        borderRadius: 24, padding: 28, border: `1.5px solid ${theme.primaryMid}`,
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: `linear-gradient(135deg, ${theme.primaryMid}, ${theme.primary})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontWeight: 800, color: '#fff', flexShrink: 0,
          boxShadow: `0 4px 16px ${theme.primary}44`,
        }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: theme.primary }}>{user?.name}</div>
          <div style={{ fontSize: 13, color: colors.textLight, marginTop: 2 }}>{user?.email}</div>
        </div>
        <button onClick={logout} style={{
          padding: '8px 18px', borderRadius: 12, border: `1.5px solid ${theme.primaryLight}`,
          background: colors.card, color: theme.primary, fontWeight: 700, fontSize: 13,
          cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
        }}>
          🚪 Logout
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 14 }}>
        {[
          { label: 'Current Weight', value: currentWeight ? `${currentWeight} kg` : '—', color: theme.primary, bg: theme.primaryLight },
          { label: 'Total Lost', value: `${totalLost} kg`, color: theme.accent2, bg: theme.accent2Light },
          { label: 'BMI', value: bmi ?? '—', color: theme.secondary, bg: theme.secondaryLight },
          { label: 'Days Logged', value: weightLogs.length, color: theme.accent3, bg: theme.accent3Light },
          { label: 'Calorie Days', value: calorieLogs.length, color: theme.accent1, bg: theme.accent1Light },
          { label: 'Step Days', value: stepLogs.length, color: theme.accent4, bg: theme.accent4Light },
        ].map(s => (
          <div key={s.label} style={{ background: colors.card, borderRadius: 16, padding: '14px 16px', border: `1.5px solid ${s.bg}` }}>
            <div style={{ fontSize: 11, color: colors.textLight, fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Edit profile */}
      <div style={{ background: colors.card, borderRadius: 20, padding: 24, border: `1.5px solid ${theme.primaryLight}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: colors.text }}>👤 Profile Details</div>
          {!editing && (
            <button onClick={() => setEditing(true)} style={{
              padding: '6px 16px', borderRadius: 10, border: `1.5px solid ${theme.primaryLight}`,
              background: colors.bg, color: theme.secondary, fontWeight: 700, fontSize: 12,
              cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
            }}>✏️ Edit</button>
          )}
        </div>

        {!editing ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { label: 'Name', value: user?.name },
              { label: 'Email', value: user?.email },
              { label: 'Age', value: user?.age ? `${user.age} years` : '—' },
              { label: 'Height', value: user?.height ? `${user.height} cm` : '—' },
              { label: 'Gender', value: user?.gender || '—' },
              { label: 'Goal Weight', value: goals.targetWeight ? `${goals.targetWeight} kg` : '—' },
            ].map(f => (
              <div key={f.label} style={{ background: colors.bg, borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: colors.textLight, fontWeight: 600, marginBottom: 4 }}>{f.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{f.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: colors.textLight, marginBottom: 6 }}>Name</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: colors.textLight, marginBottom: 6 }}>Age</label>
                <input type="number" value={form.age} onChange={e => set('age', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: colors.textLight, marginBottom: 6 }}>Height (cm)</label>
                <input type="number" value={form.height} onChange={e => set('height', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: colors.textLight, marginBottom: 6 }}>Gender</label>
                <select value={form.gender} onChange={e => set('gender', e.target.value)} style={inputStyle}>
                  <option value="">—</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            {error && <div style={{ background: '#fee2e2', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ef4444', fontWeight: 600 }}>⚠️ {error}</div>}
            {saved && <div style={{ background: theme.accent2Light, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: theme.accent2, fontWeight: 600 }}>✅ Profile updated!</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: 14, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 14, fontFamily: 'Nunito, sans-serif', background: `linear-gradient(135deg, ${theme.primaryMid}, ${theme.primary})`, color: '#fff' }}>Save Changes</button>
              <button type="button" onClick={() => setEditing(false)} style={{ flex: 1, padding: '12px', borderRadius: 14, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 14, fontFamily: 'Nunito, sans-serif', background: theme.secondaryLight, color: theme.secondary }}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* Notifications */}
      <NotificationSetup />
    </div>
  );
}
