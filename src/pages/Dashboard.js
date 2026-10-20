import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import StatCard from '../components/StatCard';
import BMITracker from '../components/BMITracker';
import StreakTracker from '../components/StreakTracker';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1.5px solid #f3e8ff', borderRadius: 12, padding: '8px 14px', fontSize: 12, fontWeight: 700, color: '#4a4063' }}>
      <div style={{ color: '#9ca3af', marginBottom: 2 }}>{fmt(label)}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: {p.value}{unit}</div>)}
    </div>
  );
};

export default function Dashboard() {
  const { weightLogs, calorieLogs, stepLogs, goals, today, getByDate } = useApp();
  const { theme, colors } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const todayWeight = getByDate(weightLogs, today);
  const todayCalories = getByDate(calorieLogs, today);
  const todaySteps = getByDate(stepLogs, today);

  const hasAnyData = weightLogs.length > 0 || calorieLogs.length > 0 || stepLogs.length > 0;

  const currentWeight = weightLogs[weightLogs.length - 1]?.weight;
  const startWeight = weightLogs[0]?.weight;
  const weightLost = startWeight && currentWeight ? (startWeight - currentWeight).toFixed(1) : null;
  const stepPct = todaySteps && goals.dailySteps ? Math.min(100, Math.round((todaySteps.steps / goals.dailySteps) * 100)) : 0;
  const deficit = todayCalories && goals.dailyCalories
    ? todayCalories.burned + (parseInt(goals.dailyCalories) - todayCalories.intake)
    : null;

  if (!hasAnyData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 64 }}>🌸</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: theme.primary }}>Welcome to SlimTrack!</div>
        <div style={{ fontSize: 14, color: colors.textLight, maxWidth: 300, lineHeight: 1.6 }}>
          Start your wellness journey by logging your first day. Track weight, calories, and steps all in one place.
        </div>
        <button onClick={() => navigate('/log')} style={{
          padding: '14px 32px', borderRadius: 20, border: 'none', cursor: 'pointer',
          fontWeight: 800, fontSize: 15, fontFamily: 'Nunito, sans-serif',
          background: `linear-gradient(135deg, ${theme.primaryMid}, ${theme.primary})`, color: '#fff',
          boxShadow: `0 4px 20px ${theme.primary}44`,
        }}>
          📝 Log Today
        </button>
        {!goals.targetWeight && (
          <button onClick={() => navigate('/goals')} style={{
            padding: '10px 24px', borderRadius: 20, border: `1.5px solid ${theme.secondaryMid}`, cursor: 'pointer',
            fontWeight: 700, fontSize: 13, fontFamily: 'Nunito, sans-serif',
            background: 'transparent', color: theme.secondary,
          }}>
            🎯 Set Goals First
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Greeting banner */}
      <div style={{
        background: `linear-gradient(135deg, ${theme.primaryLight} 0%, ${theme.secondaryLight} 100%)`,
        borderRadius: 20, padding: '20px 24px', border: `1.5px solid ${theme.primaryMid}`,
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: theme.primary }}>Hey there! 🌸</div>
        {weightLost !== null ? (
          <div style={{ fontSize: 14, color: theme.secondary, marginTop: 4 }}>
            You've lost <strong>{weightLost} kg</strong> so far. Keep going, you're doing amazing!
          </div>
        ) : (
          <div style={{ fontSize: 14, color: theme.secondary, marginTop: 4 }}>Great to see you! Keep logging your progress 💪</div>
        )}
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {goals.targetWeight && <span style={{ background: colors.card, borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, color: theme.primary }}>🎯 Goal: {goals.targetWeight} kg</span>}
          {goals.targetDate && <span style={{ background: colors.card, borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, color: theme.secondary }}>📅 By {new Date(goals.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>}
          {currentWeight && goals.targetWeight && <span style={{ background: colors.card, borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, color: theme.accent2 }}>💪 {(currentWeight - goals.targetWeight).toFixed(1)} kg to go</span>}
        </div>
      </div>

      {/* Today's stats */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: colors.textLight, marginBottom: 12 }}>TODAY</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
          <StatCard icon="⚖️" label="Weight" value={todayWeight?.weight} unit="kg" color="pink" sub={goals.targetWeight ? `Goal: ${goals.targetWeight} kg` : 'Not logged'} />
          <StatCard icon="🔥" label="Calories In" value={todayCalories?.intake} unit="kcal" color="peach" sub={goals.dailyCalories ? `Goal: ${goals.dailyCalories} kcal` : undefined} />
          <StatCard icon="💪" label="Burned" value={todayCalories?.burned} unit="kcal" color="mint" />
          <StatCard icon="📉" label="Deficit" value={deficit} unit="kcal" color="lavender" />
          <StatCard icon="👟" label="Steps" value={todaySteps?.steps?.toLocaleString()} color="blue" sub={goals.dailySteps ? `Goal: ${goals.dailySteps.toLocaleString()}` : undefined} />
          <StatCard icon="🏆" label="Step Goal" value={goals.dailySteps ? `${stepPct}%` : '—'} color="yellow" sub="completed today" />
        </div>
      </div>

      {/* BMI + Streak */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        <BMITracker weightLogs={weightLogs} height={user?.height} />
        <StreakTracker weightLogs={weightLogs} calorieLogs={calorieLogs} stepLogs={stepLogs} />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {weightLogs.length > 1 && (
          <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.primaryLight}` }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: theme.primary, marginBottom: 16 }}>⚖️ Weight Trend</div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={weightLogs.slice(-7)}>
                <defs>
                  <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.primaryMid} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={theme.primaryMid} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.primaryLight} />
                <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 10, fill: colors.textLight }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: colors.textLight }} />
                <Tooltip content={<CustomTooltip unit=" kg" />} />
                <Area type="monotone" dataKey="weight" name="Weight" stroke={theme.primary} fill="url(#wGrad)" strokeWidth={2.5} dot={{ fill: theme.primary, r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {calorieLogs.length > 0 && (
          <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.accent1Light}` }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: theme.accent1, marginBottom: 16 }}>🔥 Calories</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={calorieLogs.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.accent1Light} />
                <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 10, fill: colors.textLight }} />
                <YAxis tick={{ fontSize: 10, fill: colors.textLight }} />
                <Tooltip content={<CustomTooltip unit=" kcal" />} />
                <Bar dataKey="intake" name="Intake" fill={theme.accent1Mid} radius={[6, 6, 0, 0]} />
                <Bar dataKey="burned" name="Burned" fill={theme.accent2Mid} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {stepLogs.length > 0 && (
          <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.accent3Light}` }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: theme.accent3, marginBottom: 16 }}>👟 Steps</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={stepLogs.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.accent3Light} />
                <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 10, fill: colors.textLight }} />
                <YAxis tick={{ fontSize: 10, fill: colors.textLight }} />
                <Tooltip content={<CustomTooltip unit=" steps" />} />
                <Bar dataKey="steps" name="Steps" fill={theme.accent3Mid} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
