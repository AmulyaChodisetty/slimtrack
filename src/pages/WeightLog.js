import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from 'recharts';

const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function WeightLog() {
  const { weightLogs, biweeklyNotes, goals } = useApp();
  const { theme, colors } = useTheme();
  const navigate = useNavigate();

  if (weightLogs.length === 0) return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚖️</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: theme.primary, marginBottom: 8 }}>No weight data yet</div>
      <div style={{ fontSize: 13, color: colors.textLight, marginBottom: 20 }}>Start logging your weight to see your journey here</div>
      <button onClick={() => navigate('/log')} style={btnStyle(theme)}>📝 Log Today's Weight</button>
    </div>
  );

  const current = weightLogs[weightLogs.length - 1]?.weight;
  const start = weightLogs[0]?.weight;
  const lost = start && current ? (start - current).toFixed(1) : 0;
  const toGo = current && goals.targetWeight ? (current - goals.targetWeight).toFixed(1) : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14 }}>
        {[
          { label: 'Current', value: `${current} kg`, color: theme.primary, bg: theme.primaryLight },
          { label: 'Start Weight', value: `${start} kg`, color: theme.secondary, bg: theme.secondaryLight },
          { label: 'Lost So Far', value: `${lost} kg`, color: theme.accent2, bg: theme.accent2Light },
          { label: 'To Goal', value: `${toGo} kg`, color: theme.accent1, bg: theme.accent1Light },
        ].map(s => (
          <div key={s.label} style={{ background: colors.card, borderRadius: 18, padding: 16, border: `1.5px solid ${s.bg}` }}>
            <div style={{ fontSize: 11, color: colors.textLight, fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.primaryLight}` }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: theme.primary, marginBottom: 16 }}>📈 Weight Journey</div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={weightLogs}>
            <defs>
              <linearGradient id="wg2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.primaryMid} stopOpacity={0.5} />
                <stop offset="95%" stopColor={theme.primaryMid} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.primaryLight} />
            <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 10, fill: colors.textLight }} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: colors.textLight }} />
            <Tooltip content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div style={{ background: colors.card, border: `1.5px solid ${theme.primaryLight}`, borderRadius: 12, padding: '8px 14px', fontSize: 12, fontWeight: 700 }}>
                  <div style={{ color: colors.textLight }}>{fmt(label)}</div>
                  <div style={{ color: theme.primary }}>{payload[0]?.value} kg</div>
                  {payload[0]?.payload?.note && <div style={{ color: colors.textLight, fontSize: 11 }}>{payload[0].payload.note}</div>}
                </div>
              );
            }} />
            {goals.targetWeight && (
              <ReferenceLine y={goals.targetWeight} stroke={theme.secondaryMid} strokeDasharray="5 5"
                label={{ value: 'Goal', fill: theme.secondary, fontSize: 11 }} />
            )}
            <Area type="monotone" dataKey="weight" stroke={theme.primary} fill="url(#wg2)" strokeWidth={2.5} dot={{ fill: theme.primary, r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* History */}
      <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.primaryLight}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: theme.primary }}>📋 Weight History</div>
          <button onClick={() => navigate('/log')} style={{ ...btnStyle(theme), padding: '6px 16px', fontSize: 12 }}>+ Log</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...weightLogs].reverse().map((log, i) => (
            <div key={log.date} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderRadius: 12,
              background: i === 0 ? theme.primaryLight : colors.bg,
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: colors.text }}>{fmt(log.date)}</div>
                {log.note && <div style={{ fontSize: 11, color: colors.textLight }}>{log.note}</div>}
              </div>
              <div style={{ fontWeight: 800, fontSize: 18, color: theme.primary }}>{log.weight} kg</div>
            </div>
          ))}
        </div>
      </div>

      {/* Biweekly notes */}
      {biweeklyNotes.length > 0 && (
        <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.secondaryLight}` }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: theme.secondary, marginBottom: 14 }}>💜 Biweekly Check-ins</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...biweeklyNotes].reverse().map((n, i) => (
              <div key={i} style={{ background: colors.bg, borderRadius: 14, padding: '12px 16px', border: `1.5px solid ${theme.secondaryLight}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 12, color: theme.secondary }}>{fmt(n.date)}</span>
                  <span style={{ fontWeight: 800, fontSize: 15, color: theme.primary }}>{n.weight} kg</span>
                </div>
                <div style={{ fontSize: 13, color: colors.text }}>{n.note}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle = (theme) => ({
  padding: '12px 24px', borderRadius: 14, border: 'none', cursor: 'pointer',
  fontWeight: 800, fontSize: 14, fontFamily: 'Nunito, sans-serif',
  background: `linear-gradient(135deg, ${theme.primaryMid}, ${theme.primary})`, color: '#fff',
});
