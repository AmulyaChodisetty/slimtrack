import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import {
  ComposedChart, Bar, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function Calories() {
  const { calorieLogs, goals } = useApp();
  const { theme, colors } = useTheme();
  const navigate = useNavigate();

  if (calorieLogs.length === 0) return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔥</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: theme.accent1, marginBottom: 8 }}>No calorie data yet</div>
      <div style={{ fontSize: 13, color: colors.textLight, marginBottom: 20 }}>Log your calories to track your deficit and progress</div>
      <button onClick={() => navigate('/log')} style={btnStyle(theme)}>📝 Log Today's Calories</button>
    </div>
  );

  const Tip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: colors.card, border: `1.5px solid ${theme.accent1Light}`, borderRadius: 12, padding: '10px 14px', fontSize: 12, fontWeight: 700 }}>
        <div style={{ color: colors.textLight, marginBottom: 4 }}>{fmt(label)}</div>
        {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: {p.value} kcal</div>)}
      </div>
    );
  };

  const deficitData = calorieLogs.map(l => ({
    ...l,
    deficit: goals.dailyCalories ? l.burned + (parseInt(goals.dailyCalories) - l.intake) : l.burned - l.intake,
  }));

  const avgDeficit = Math.round(deficitData.reduce((s, d) => s + d.deficit, 0) / deficitData.length);
  const totalDeficit = deficitData.reduce((s, d) => s + d.deficit, 0);
  const estLost = (totalDeficit / 7700).toFixed(2);
  const todayLog = calorieLogs[calorieLogs.length - 1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
        {[
          { label: 'Latest Intake', value: todayLog?.intake, unit: 'kcal', color: theme.accent1, bg: theme.accent1Light },
          { label: 'Latest Burned', value: todayLog?.burned, unit: 'kcal', color: theme.accent2, bg: theme.accent2Light },
          { label: 'Avg Daily Deficit', value: avgDeficit, unit: 'kcal', color: theme.secondary, bg: theme.secondaryLight },
          { label: 'Total Deficit', value: totalDeficit, unit: 'kcal', color: theme.accent3, bg: theme.accent3Light },
          { label: 'Est. Fat Lost', value: estLost, unit: 'kg', color: theme.primary, bg: theme.primaryLight },
        ].map(s => (
          <div key={s.label} style={{ background: colors.card, borderRadius: 18, padding: 16, border: `1.5px solid ${s.bg}` }}>
            <div style={{ fontSize: 11, color: colors.textLight, fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value ?? '—'} <span style={{ fontSize: 11 }}>{s.unit}</span></div>
          </div>
        ))}
      </div>

      {/* Intake vs Burned */}
      <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.accent1Light}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: theme.accent1 }}>🔥 Intake vs Burned</div>
          <button onClick={() => navigate('/log')} style={{ ...btnStyle(theme), padding: '6px 16px', fontSize: 12 }}>+ Log</button>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={calorieLogs}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.accent1Light} />
            <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 10, fill: colors.textLight }} />
            <YAxis tick={{ fontSize: 10, fill: colors.textLight }} />
            <Tooltip content={<Tip />} />
            <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
            <Bar dataKey="intake" name="Intake" fill={theme.accent1Mid} radius={[6, 6, 0, 0]} />
            <Bar dataKey="burned" name="Burned" fill={theme.accent2Mid} radius={[6, 6, 0, 0]} />
            <Line type="monotone" dataKey="intake" stroke={theme.accent1} strokeWidth={2} dot={false} name="Trend" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Deficit chart */}
      <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.secondaryLight}` }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: theme.secondary, marginBottom: 16 }}>📉 Daily Calorie Deficit</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={deficitData}>
            <defs>
              <linearGradient id="defGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.secondaryMid} stopOpacity={0.5} />
                <stop offset="95%" stopColor={theme.secondaryMid} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.secondaryLight} />
            <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 10, fill: colors.textLight }} />
            <YAxis tick={{ fontSize: 10, fill: colors.textLight }} />
            <Tooltip content={<Tip />} />
            <Area type="monotone" dataKey="deficit" name="Deficit" stroke={theme.secondary} fill="url(#defGrad)" strokeWidth={2.5} dot={{ fill: theme.secondary, r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* History */}
      <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.accent1Light}` }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: theme.accent1, marginBottom: 14 }}>📋 Calorie History</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...calorieLogs].reverse().map((log, i) => {
            const def = goals.dailyCalories ? log.burned + (parseInt(goals.dailyCalories) - log.intake) : log.burned - log.intake;
            return (
              <div key={log.date} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: 12,
                background: i === 0 ? theme.accent1Light : colors.bg,
              }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: colors.text }}>{fmt(log.date)}</div>
                <div style={{ display: 'flex', gap: 14, fontSize: 12, fontWeight: 700, flexWrap: 'wrap' }}>
                  <span style={{ color: theme.accent1 }}>🔥 {log.intake}</span>
                  <span style={{ color: theme.accent2 }}>💪 {log.burned}</span>
                  <span style={{ color: def >= 0 ? theme.secondary : '#ef4444' }}>📉 {def > 0 ? '+' : ''}{def}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const btnStyle = (theme) => ({
  padding: '12px 24px', borderRadius: 14, border: 'none', cursor: 'pointer',
  fontWeight: 800, fontSize: 14, fontFamily: 'Nunito, sans-serif',
  background: `linear-gradient(135deg, ${theme.accent1Mid}, ${theme.accent1})`, color: '#fff',
});
