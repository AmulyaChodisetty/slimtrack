import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine, Cell,
} from 'recharts';

const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function Steps() {
  const { stepLogs, goals } = useApp();
  const { theme, colors } = useTheme();
  const navigate = useNavigate();

  if (stepLogs.length === 0) return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>👟</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: theme.accent3, marginBottom: 8 }}>No step data yet</div>
      <div style={{ fontSize: 13, color: colors.textLight, marginBottom: 20 }}>Start logging your steps to track your activity</div>
      <button onClick={() => navigate('/log')} style={btnStyle(theme)}>📝 Log Today's Steps</button>
    </div>
  );

  const Tip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: colors.card, border: `1.5px solid ${theme.accent3Light}`, borderRadius: 12, padding: '10px 14px', fontSize: 12, fontWeight: 700 }}>
        <div style={{ color: colors.textLight, marginBottom: 4 }}>{fmt(label)}</div>
        <div style={{ color: theme.accent3 }}>👟 {payload[0]?.value?.toLocaleString()} steps</div>
      </div>
    );
  };

  const latest = stepLogs[stepLogs.length - 1];
  const avgSteps = Math.round(stepLogs.reduce((s, l) => s + l.steps, 0) / stepLogs.length);
  const goalDays = stepLogs.filter(l => goals.dailySteps && l.steps >= goals.dailySteps).length;
  const pct = latest && goals.dailySteps ? Math.min(100, Math.round((latest.steps / goals.dailySteps) * 100)) : 0;

  const stepsWithColor = stepLogs.map(l => ({
    ...l,
    fill: goals.dailySteps && l.steps >= goals.dailySteps ? theme.accent2Mid : theme.accent3Mid,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
        {[
          { label: 'Latest Steps', value: latest?.steps?.toLocaleString() ?? '—', color: theme.accent3, bg: theme.accent3Light },
          { label: 'Daily Goal', value: goals.dailySteps ? parseInt(goals.dailySteps).toLocaleString() : '—', color: theme.secondary, bg: theme.secondaryLight },
          { label: 'Goal Progress', value: `${pct}%`, color: theme.accent2, bg: theme.accent2Light },
          { label: 'Avg Steps', value: avgSteps.toLocaleString(), color: theme.accent1, bg: theme.accent1Light },
          { label: 'Goal Days', value: `${goalDays}/${stepLogs.length}`, color: theme.primary, bg: theme.primaryLight },
        ].map(s => (
          <div key={s.label} style={{ background: colors.card, borderRadius: 18, padding: 16, border: `1.5px solid ${s.bg}` }}>
            <div style={{ fontSize: 11, color: colors.textLight, fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Progress ring */}
      <div style={{ background: colors.card, borderRadius: 20, padding: 24, border: `1.5px solid ${theme.accent3Light}`, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
          <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="60" cy="60" r="50" fill="none" stroke={theme.accent3Light} strokeWidth="12" />
            <circle cx="60" cy="60" r="50" fill="none" stroke={theme.accent3Mid} strokeWidth="12"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`}
              strokeLinecap="round" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: theme.accent3 }}>{pct}%</div>
            <div style={{ fontSize: 10, color: colors.textLight, fontWeight: 600 }}>of goal</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: theme.accent3 }}>{latest?.steps?.toLocaleString()} steps</div>
          <div style={{ fontSize: 13, color: colors.textLight, marginTop: 4 }}>
            {goals.dailySteps && latest
              ? goals.dailySteps - latest.steps > 0
                ? `${(goals.dailySteps - latest.steps).toLocaleString()} more to reach your goal!`
                : '🎉 Goal reached! Amazing!'
              : 'Set a step goal to track progress'}
          </div>
          <button onClick={() => navigate('/log')} style={{ ...btnStyle(theme), padding: '8px 20px', fontSize: 12, marginTop: 12 }}>+ Log Steps</button>
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.accent3Light}` }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: theme.accent3, marginBottom: 16 }}>
          👟 Daily Steps <span style={{ color: theme.accent2Mid, fontSize: 12 }}>🟢 = goal reached</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stepsWithColor}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.accent3Light} />
            <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 10, fill: colors.textLight }} />
            <YAxis tick={{ fontSize: 10, fill: colors.textLight }} />
            <Tooltip content={<Tip />} />
            {goals.dailySteps && (
              <ReferenceLine y={parseInt(goals.dailySteps)} stroke={theme.secondaryMid} strokeDasharray="5 5"
                label={{ value: 'Goal', fill: theme.secondary, fontSize: 11 }} />
            )}
            <Bar dataKey="steps" radius={[8, 8, 0, 0]}>
              {stepsWithColor.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Area trend */}
      <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.accent3Light}` }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: theme.accent3, marginBottom: 16 }}>📈 Steps Trend</div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={stepLogs}>
            <defs>
              <linearGradient id="sGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.accent3Mid} stopOpacity={0.5} />
                <stop offset="95%" stopColor={theme.accent3Mid} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.accent3Light} />
            <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 10, fill: colors.textLight }} />
            <YAxis tick={{ fontSize: 10, fill: colors.textLight }} />
            <Tooltip content={<Tip />} />
            <Area type="monotone" dataKey="steps" stroke={theme.accent3} fill="url(#sGrad)" strokeWidth={2.5} dot={{ fill: theme.accent3, r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* History */}
      <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.accent3Light}` }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: theme.accent3, marginBottom: 14 }}>📋 Steps History</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...stepLogs].reverse().map((log, i) => {
            const p = goals.dailySteps ? Math.min(100, Math.round((log.steps / goals.dailySteps) * 100)) : null;
            return (
              <div key={log.date} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: 12,
                background: i === 0 ? theme.accent3Light : colors.bg,
              }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: colors.text }}>{fmt(log.date)}</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {p !== null && <span style={{ fontSize: 11, fontWeight: 700, color: p >= 100 ? theme.accent2 : colors.textLight }}>{p}%</span>}
                  <span style={{ fontWeight: 800, fontSize: 16, color: theme.accent3 }}>👟 {log.steps.toLocaleString()}</span>
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
  background: `linear-gradient(135deg, ${theme.accent3Mid}, ${theme.accent3})`, color: '#fff',
});
