import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

export default function Goals() {
  const { goals, setGoals, weightLogs, calorieLogs, stepLogs, today } = useApp();
  const { theme, colors } = useTheme();
  const [form, setForm] = useState({ ...goals });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setGoals({
      targetWeight: parseFloat(form.targetWeight),
      dailyCalories: parseInt(form.dailyCalories),
      dailySteps: parseInt(form.dailySteps),
      targetDate: form.targetDate,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const currentWeight = weightLogs[weightLogs.length - 1]?.weight;
  const startWeight = weightLogs[0]?.weight;
  const todayCalories = calorieLogs.find(l => l.date === today);
  const todaySteps = stepLogs.find(l => l.date === today);

  const weightPct = startWeight && currentWeight
    ? Math.min(100, Math.round(((startWeight - currentWeight) / (startWeight - goals.targetWeight)) * 100)) : 0;
  const calPct = todayCalories
    ? Math.min(100, Math.round((goals.dailyCalories / todayCalories.intake) * 100)) : 0;
  const stepPct = todaySteps
    ? Math.min(100, Math.round((todaySteps.steps / goals.dailySteps) * 100)) : 0;

  const radialData = [
    { name: 'Weight Goal', value: weightPct, fill: theme.primaryMid },
    { name: 'Calorie Goal', value: calPct, fill: theme.accent1Mid },
    { name: 'Step Goal', value: stepPct, fill: theme.accent3Mid },
  ];

  const daysLeft = goals.targetDate
    ? Math.max(0, Math.ceil((new Date(goals.targetDate) - new Date()) / (1000 * 60 * 60 * 24))) : null;

  const weeklyLoss = weightLogs.length > 1
    ? ((weightLogs[0].weight - currentWeight) / (weightLogs.length / 7)).toFixed(2) : 0;

  const projectedWeeks = weeklyLoss > 0
    ? Math.ceil((currentWeight - goals.targetWeight) / weeklyLoss) : null;

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 12,
    border: `1.5px solid ${theme.primaryLight}`, fontSize: 13, fontFamily: 'Nunito, sans-serif',
    color: colors.text, outline: 'none', background: colors.bg, boxSizing: 'border-box',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Radial progress */}
      <div style={{ background: colors.card, borderRadius: 20, padding: 24, border: `1.5px solid ${theme.primaryLight}` }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: theme.primary, marginBottom: 4 }}>🎯 Goal Progress Overview</div>
        <div style={{ fontSize: 11, color: colors.textLight, marginBottom: 8 }}>Inner = Steps · Middle = Calories · Outer = Weight</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <ResponsiveContainer width={200} height={200}>
            <RadialBarChart innerRadius={30} outerRadius={90} data={radialData} startAngle={90} endAngle={-270}>
              <RadialBar minAngle={5} dataKey="value" cornerRadius={8} background={{ fill: theme.secondaryLight }} />
              <Tooltip formatter={(v) => `${v}%`} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Weight Goal', pct: weightPct, color: theme.primary, bg: theme.primaryLight },
              { label: 'Calorie Goal', pct: calPct, color: theme.accent1, bg: theme.accent1Light },
              { label: 'Step Goal', pct: stepPct, color: theme.accent3, bg: theme.accent3Light },
            ].map(g => (
              <div key={g.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>{g.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: g.color }}>{g.pct}%</span>
                </div>
                <div style={{ background: g.bg, borderRadius: 20, height: 8, width: 180, overflow: 'hidden' }}>
                  <div style={{ background: g.color, height: '100%', width: `${g.pct}%`, borderRadius: 20, transition: 'width 0.5s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projection */}
      <div style={{ background: `linear-gradient(135deg, ${theme.accent2Light}, ${theme.accent3Light})`, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.accent2Mid}` }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: theme.accent2, marginBottom: 12 }}>🔮 Projection</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {[
            { label: 'Avg Weekly Loss', value: `${weeklyLoss} kg/wk`, color: theme.accent2 },
            { label: 'Est. Weeks to Goal', value: projectedWeeks ? `${projectedWeeks} weeks` : 'N/A', color: theme.accent3 },
            { label: 'Days to Target Date', value: daysLeft !== null ? `${daysLeft} days` : '—', color: theme.secondary },
            { label: 'Still to Lose', value: `${Math.max(0, (currentWeight || 0) - (goals.targetWeight || 0)).toFixed(1)} kg`, color: theme.primary },
          ].map(p => (
            <div key={p.label} style={{ background: colors.card, borderRadius: 14, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: colors.textLight, fontWeight: 600, marginBottom: 4 }}>{p.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: p.color }}>{p.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit goals form */}
      <form onSubmit={handleSave} style={{ background: colors.card, borderRadius: 20, padding: 24, border: `1.5px solid ${theme.primaryLight}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: theme.primary }}>✏️ Edit Goals</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: colors.textLight, marginBottom: 6 }}>Target Weight (kg)</label>
            <input type="number" step="0.1" value={form.targetWeight} onChange={e => setForm(p => ({ ...p, targetWeight: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: colors.textLight, marginBottom: 6 }}>Daily Calorie Goal (kcal)</label>
            <input type="number" value={form.dailyCalories} onChange={e => setForm(p => ({ ...p, dailyCalories: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: colors.textLight, marginBottom: 6 }}>Daily Step Goal</label>
            <input type="number" value={form.dailySteps} onChange={e => setForm(p => ({ ...p, dailySteps: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: colors.textLight, marginBottom: 6 }}>Target Date</label>
            <input type="date" value={form.targetDate} onChange={e => setForm(p => ({ ...p, targetDate: e.target.value }))} style={inputStyle} />
          </div>
        </div>
        <button type="submit" style={{ padding: '12px', borderRadius: 14, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 14, fontFamily: 'Nunito, sans-serif', background: `linear-gradient(135deg, ${theme.primaryMid}, ${theme.primary})`, color: '#fff' }}>
          {saved ? '✅ Saved!' : 'Save Goals 🎯'}
        </button>
      </form>

      {/* Current goals display */}
      <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.secondaryLight}` }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: theme.secondary, marginBottom: 14 }}>📌 Current Goals</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { icon: '⚖️', label: 'Target Weight', value: goals.targetWeight ? `${goals.targetWeight} kg` : '—', color: theme.primary, bg: theme.primaryLight },
            { icon: '🔥', label: 'Daily Calories', value: goals.dailyCalories ? `${goals.dailyCalories} kcal` : '—', color: theme.accent1, bg: theme.accent1Light },
            { icon: '👟', label: 'Daily Steps', value: goals.dailySteps ? parseInt(goals.dailySteps).toLocaleString() : '—', color: theme.accent3, bg: theme.accent3Light },
            { icon: '📅', label: 'Target Date', value: goals.targetDate ? new Date(goals.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—', color: theme.secondary, bg: theme.secondaryLight },
          ].map(g => (
            <div key={g.label} style={{ background: g.bg, borderRadius: 16, padding: '14px 16px' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{g.icon}</div>
              <div style={{ fontSize: 11, color: colors.textLight, fontWeight: 600, marginBottom: 4 }}>{g.label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: g.color }}>{g.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
