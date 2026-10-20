import React from 'react';

export default function StatCard({ icon, label, value, unit, color, sub }) {
  const colors = {
    pink: { bg: '#fce7f3', icon: '#f9a8d4', text: '#ec4899' },
    lavender: { bg: '#ede9fe', icon: '#c4b5fd', text: '#7c3aed' },
    peach: { bg: '#ffedd5', icon: '#fdba74', text: '#ea580c' },
    mint: { bg: '#d1fae5', icon: '#6ee7b7', text: '#059669' },
    blue: { bg: '#dbeafe', icon: '#93c5fd', text: '#2563eb' },
    yellow: { bg: '#fef9c3', icon: '#fde68a', text: '#ca8a04' },
  };
  const c = colors[color] || colors.pink;

  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      padding: '20px',
      boxShadow: '0 2px 12px rgba(196,181,253,0.15)',
      border: `1.5px solid ${c.bg}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          background: c.bg,
          borderRadius: 12,
          width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>{icon}</div>
        <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: c.text }}>{value ?? '—'}</span>
        {unit && <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600 }}>{unit}</span>}
      </div>
      {sub && <span style={{ fontSize: 12, color: '#9ca3af' }}>{sub}</span>}
    </div>
  );
}
