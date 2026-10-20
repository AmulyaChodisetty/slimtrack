import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function CalendarHeatmap({ weightLogs, calorieLogs, stepLogs }) {
  const { theme, colors } = useTheme();

  const today = new Date();
  const weeks = 15;
  const days = [];

  for (let i = (weeks * 7) - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const hasWeight = weightLogs.some(l => l.date === dateStr);
    const hasCalories = calorieLogs.some(l => l.date === dateStr);
    const hasSteps = stepLogs.some(l => l.date === dateStr);
    const count = [hasWeight, hasCalories, hasSteps].filter(Boolean).length;
    days.push({ date: dateStr, count, day: d.getDay(), label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) });
  }

  const getColor = (count) => {
    if (count === 0) return colors.border;
    if (count === 1) return theme.primaryMid + '80';
    if (count === 2) return theme.primaryMid;
    return theme.primary;
  };

  const monthLabels = [];
  days.forEach((d, i) => {
    if (i % 7 === 0) {
      const month = new Date(d.date).toLocaleDateString('en-US', { month: 'short' });
      if (!monthLabels.length || monthLabels[monthLabels.length - 1].label !== month)
        monthLabels.push({ col: Math.floor(i / 7), label: month });
    }
  });

  const cols = [];
  for (let w = 0; w < weeks; w++) cols.push(days.slice(w * 7, w * 7 + 7));

  return (
    <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${colors.border}` }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: theme.primary, marginBottom: 16 }}>📅 Activity Heatmap</div>

      {/* Month labels */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 4, paddingLeft: 24 }}>
        {cols.map((_, wi) => {
          const ml = monthLabels.find(m => m.col === wi);
          return <div key={wi} style={{ width: 14, fontSize: 9, color: colors.textLight, fontWeight: 600, flexShrink: 0 }}>{ml?.label || ''}</div>;
        })}
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        {/* Day labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginRight: 4 }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} style={{ height: 14, fontSize: 9, color: colors.textLight, fontWeight: 600, lineHeight: '14px' }}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        {cols.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {week.map((day, di) => (
              <div key={di} title={`${day.label}: ${day.count}/3 logged`} style={{
                width: 14, height: 14, borderRadius: 3,
                background: getColor(day.count),
                cursor: 'default', transition: 'transform 0.1s',
                flexShrink: 0,
              }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.3)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 11, color: colors.textLight }}>Less</span>
        {[0, 1, 2, 3].map(c => (
          <div key={c} style={{ width: 12, height: 12, borderRadius: 3, background: getColor(c) }} />
        ))}
        <span style={{ fontSize: 11, color: colors.textLight }}>More</span>
      </div>
    </div>
  );
}
