import React from 'react';
import { useTheme } from '../context/ThemeContext';

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

const calcLongest = (logs) => {
  if (!logs.length) return 0;
  const dates = [...new Set(logs.map(l => l.date))].sort();
  let longest = 1, current = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i]) - new Date(dates[i - 1])) / 86400000;
    if (diff === 1) { current++; longest = Math.max(longest, current); }
    else current = 1;
  }
  return longest;
};

const getStreakEmoji = (streak) => {
  if (streak >= 30) return '🏆';
  if (streak >= 14) return '💎';
  if (streak >= 7)  return '🔥';
  if (streak >= 3)  return '⭐';
  return '🌱';
};

const milestones = [3, 7, 14, 30, 60, 100];

export default function StreakTracker({ weightLogs, calorieLogs, stepLogs }) {
  const { theme, colors } = useTheme();

  const allLogs = [...weightLogs, ...calorieLogs, ...stepLogs];
  const uniqueDates = [...new Set(allLogs.map(l => l.date))].map(d => ({ date: d }));

  const overallStreak = calcStreak(uniqueDates);
  const weightStreak = calcStreak(weightLogs);
  const calorieStreak = calcStreak(calorieLogs);
  const stepStreak = calcStreak(stepLogs);
  const longestStreak = calcLongest(uniqueDates);
  const totalDays = uniqueDates.length;

  const nextMilestone = milestones.find(m => m > overallStreak) || milestones[milestones.length - 1];
  const progressToNext = Math.min(100, Math.round((overallStreak / nextMilestone) * 100));

  // Last 7 days activity
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    return {
      dateStr,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: i === 6,
      weight: weightLogs.some(l => l.date === dateStr),
      calories: calorieLogs.some(l => l.date === dateStr),
      steps: stepLogs.some(l => l.date === dateStr),
    };
  });

  return (
    <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.primaryLight}` }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: theme.primary, marginBottom: 16 }}>🔥 Streak Tracker</div>

      {/* Main streak */}
      <div style={{ background: `linear-gradient(135deg, ${theme.primaryLight}, ${theme.secondaryLight})`, borderRadius: 16, padding: '20px', marginBottom: 16, border: `1.5px solid ${theme.primaryMid}`, textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>{getStreakEmoji(overallStreak)}</div>
        <div style={{ fontSize: 48, fontWeight: 800, color: theme.primary, lineHeight: 1 }}>{overallStreak}</div>
        <div style={{ fontSize: 13, color: theme.secondary, fontWeight: 700, marginTop: 4 }}>day streak</div>
        <div style={{ fontSize: 11, color: colors.textLight, marginTop: 4 }}>Longest: {longestStreak} days · Total: {totalDays} days logged</div>

        {/* Progress to next milestone */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: colors.textLight, fontWeight: 600 }}>Next milestone: {nextMilestone} days</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: theme.primary }}>{progressToNext}%</span>
          </div>
          <div style={{ background: colors.bg, borderRadius: 20, height: 8, overflow: 'hidden' }}>
            <div style={{ background: `linear-gradient(90deg, ${theme.primaryMid}, ${theme.primary})`, height: '100%', width: `${progressToNext}%`, borderRadius: 20, transition: 'width 0.5s' }} />
          </div>
          <div style={{ fontSize: 11, color: colors.textLight, marginTop: 4 }}>{nextMilestone - overallStreak} more days to go!</div>
        </div>
      </div>

      {/* Per-category streaks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Weight', streak: weightStreak, color: theme.primary, bg: theme.primaryLight, icon: '⚖️' },
          { label: 'Calories', streak: calorieStreak, color: theme.accent1, bg: theme.accent1Light, icon: '🔥' },
          { label: 'Steps', streak: stepStreak, color: theme.accent3, bg: theme.accent3Light, icon: '👟' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: '12px', textAlign: 'center', border: `1.5px solid ${s.color}22` }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.streak}</div>
            <div style={{ fontSize: 10, color: colors.textLight, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Last 7 days */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: colors.textLight, marginBottom: 10 }}>LAST 7 DAYS</div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
          {last7.map((day) => {
            const logged = day.weight || day.calories || day.steps;
            const count = [day.weight, day.calories, day.steps].filter(Boolean).length;
            return (
              <div key={day.dateStr} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                <div style={{ fontSize: 10, color: day.isToday ? theme.primary : colors.textLight, fontWeight: day.isToday ? 800 : 600 }}>{day.label}</div>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: logged ? (count === 3 ? theme.primary : theme.primaryLight) : colors.bg,
                  border: `2px solid ${day.isToday ? theme.primary : logged ? theme.primaryMid : colors.border}`,
                  fontSize: 14,
                }}>
                  {logged ? (count === 3 ? '✓' : count) : '·'}
                </div>
                <div style={{ fontSize: 9, color: logged ? theme.primary : colors.textLight, fontWeight: 700 }}>
                  {count}/3
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone badges */}
      <div style={{ marginTop: 16, borderTop: `1.5px solid ${colors.border}`, paddingTop: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: colors.textLight, marginBottom: 10 }}>MILESTONES</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {milestones.map(m => {
            const achieved = longestStreak >= m;
            return (
              <div key={m} style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: achieved ? theme.primaryLight : colors.bg,
                color: achieved ? theme.primary : colors.textLight,
                border: `1.5px solid ${achieved ? theme.primaryMid : colors.border}`,
              }}>
                {achieved ? '✓' : '🔒'} {m} days
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
