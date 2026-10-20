import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

export default function WeeklyReport({ weightLogs, calorieLogs, stepLogs, goals }) {
  const { theme, colors } = useTheme();

  const today = new Date();
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const weekWeight = weightLogs.filter(l => weekDates.includes(l.date));
  const weekCalories = calorieLogs.filter(l => weekDates.includes(l.date));
  const weekSteps = stepLogs.filter(l => weekDates.includes(l.date));

  const avgWeight = weekWeight.length ? (weekWeight.reduce((s, l) => s + l.weight, 0) / weekWeight.length).toFixed(1) : null;
  const avgCalories = weekCalories.length ? Math.round(weekCalories.reduce((s, l) => s + l.intake, 0) / weekCalories.length) : null;
  const avgSteps = weekSteps.length ? Math.round(weekSteps.reduce((s, l) => s + l.steps, 0) / weekSteps.length) : null;
  const totalDeficit = weekCalories.reduce((s, l) => s + (l.burned + (parseInt(goals.dailyCalories || 0) - l.intake)), 0);

  // Streaks
  const calcStreak = (logs) => {
    let streak = 0;
    const d = new Date();
    while (true) {
      const dateStr = d.toISOString().split('T')[0];
      if (logs.some(l => l.date === dateStr)) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  };

  const weightStreak = calcStreak(weightLogs);
  const stepStreak = calcStreak(stepLogs);
  const calorieStreak = calcStreak(calorieLogs);

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${colors.border}` }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: theme.primary, marginBottom: 16 }}>📊 This Week's Report</div>

      {/* Day dots */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {weekDates.map((date, i) => {
          const hasW = weightLogs.some(l => l.date === date);
          const hasC = calorieLogs.some(l => l.date === date);
          const hasS = stepLogs.some(l => l.date === date);
          const isToday = date === today.toISOString().split('T')[0];
          return (
            <div key={date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontSize: 10, color: isToday ? theme.primary : colors.textLight, fontWeight: isToday ? 800 : 600 }}>
                {dayLabels[new Date(date).getDay() === 0 ? 6 : new Date(date).getDay() - 1]}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[{ has: hasW, color: theme.primary }, { has: hasC, color: theme.accent1 }, { has: hasS, color: theme.accent3 }].map((dot, di) => (
                  <div key={di} style={{ width: 8, height: 8, borderRadius: '50%', background: dot.has ? dot.color : colors.border }} />
                ))}
              </div>
            </div>
          );
        })}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginLeft: 8, justifyContent: 'flex-end' }}>
          {[{ label: '⚖️ Weight', color: theme.primary }, { label: '🔥 Calories', color: theme.accent1 }, { label: '👟 Steps', color: theme.accent3 }].map((l, i) => (
            <div key={i} style={{ fontSize: 10, color: colors.textLight, fontWeight: 600 }}>{l.label}</div>
          ))}
        </div>
      </div>

      {/* Weekly averages */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Avg Weight', value: avgWeight ? `${avgWeight} kg` : '—', color: theme.primary, bg: theme.primaryLight },
          { label: 'Avg Calories', value: avgCalories ? `${avgCalories} kcal` : '—', color: theme.accent1, bg: theme.accent1Light },
          { label: 'Avg Steps', value: avgSteps ? avgSteps.toLocaleString() : '—', color: theme.accent3, bg: theme.accent3Light },
          { label: 'Total Deficit', value: totalDeficit ? `${totalDeficit} kcal` : '—', color: theme.secondary, bg: theme.secondaryLight },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={{ background: s.bg, borderRadius: 14, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, color: colors.textLight, fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Streaks */}
      <div style={{ borderTop: `1.5px solid ${colors.border}`, paddingTop: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: colors.textLight, marginBottom: 10 }}>🔥 CURRENT STREAKS</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Weight', streak: weightStreak, color: theme.primary },
            { label: 'Calories', streak: calorieStreak, color: theme.accent1 },
            { label: 'Steps', streak: stepStreak, color: theme.accent3 },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, background: colors.bg, borderRadius: 12, padding: '8px 14px' }}>
              <span style={{ fontSize: 18 }}>{s.streak >= 7 ? '🏆' : s.streak >= 3 ? '🔥' : '⭐'}</span>
              <div>
                <div style={{ fontSize: 11, color: colors.textLight, fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.streak} day{s.streak !== 1 ? 's' : ''}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
