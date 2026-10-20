import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import CalendarHeatmap from '../components/CalendarHeatmap';
import WeeklyReport from '../components/WeeklyReport';
import {
  ComposedChart, Bar, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, Legend,
} from 'recharts';

const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function Progress() {
  const { weightLogs, calorieLogs, stepLogs, goals } = useApp();
  const { theme, colors } = useTheme();
  const navigate = useNavigate();
  const [range, setRange] = useState(14);

  const Tip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: colors.card, border: `1.5px solid ${theme.secondaryLight}`, borderRadius: 12, padding: '10px 14px', fontSize: 12, fontWeight: 700 }}>
        <div style={{ color: colors.textLight, marginBottom: 4 }}>{fmt(label)}</div>
        {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>)}
      </div>
    );
  };

  const hasData = weightLogs.length > 0 || calorieLogs.length > 0 || stepLogs.length > 0;

  if (!hasData) return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: theme.secondary, marginBottom: 8 }}>No data to visualize yet</div>
      <div style={{ fontSize: 13, color: colors.textLight, marginBottom: 20 }}>Log a few days to unlock your progress charts</div>
      <button onClick={() => navigate('/log')} style={{ padding: '12px 28px', borderRadius: 14, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 14, fontFamily: 'Nunito, sans-serif', background: `linear-gradient(135deg, ${theme.secondaryMid}, ${theme.secondary})`, color: '#fff' }}>📝 Start Logging</button>
    </div>
  );

  const wSlice = weightLogs.slice(-range);
  const cSlice = calorieLogs.slice(-range);
  const sSlice = stepLogs.slice(-range);

  const merged = wSlice.map(w => {
    const c = cSlice.find(l => l.date === w.date) || {};
    const s = sSlice.find(l => l.date === w.date) || {};
    return {
      date: w.date, weight: w.weight, intake: c.intake, burned: c.burned,
      deficit: c.intake && c.burned && goals.dailyCalories
        ? c.burned + (parseInt(goals.dailyCalories) - c.intake) : null,
      steps: s.steps,
    };
  });

  const avgSteps = sSlice.length ? sSlice.reduce((s, l) => s + l.steps, 0) / sSlice.length : 0;
  const avgIntake = cSlice.length ? cSlice.reduce((s, l) => s + l.intake, 0) / cSlice.length : 0;
  const avgBurned = cSlice.length ? cSlice.reduce((s, l) => s + l.burned, 0) / cSlice.length : 0;
  const avgDeficit = cSlice.length && goals.dailyCalories
    ? cSlice.reduce((s, l) => s + (l.burned + (parseInt(goals.dailyCalories) - l.intake)), 0) / cSlice.length : 0;
  const weightProgress = weightLogs.length > 1 && goals.targetWeight
    ? ((weightLogs[0].weight - weightLogs[weightLogs.length - 1].weight) / (weightLogs[0].weight - goals.targetWeight)) * 100 : 0;

  const radarData = [
    { metric: 'Steps', value: goals.dailySteps ? Math.min(100, Math.round((avgSteps / goals.dailySteps) * 100)) : 0 },
    { metric: 'Deficit', value: Math.min(100, Math.max(0, Math.round((avgDeficit / 500) * 100))) },
    { metric: 'Calories', value: avgIntake && goals.dailyCalories ? Math.min(100, Math.round((parseInt(goals.dailyCalories) / avgIntake) * 100)) : 0 },
    { metric: 'Weight', value: Math.min(100, Math.max(0, Math.round(weightProgress))) },
    { metric: 'Activity', value: Math.min(100, Math.round((avgBurned / 400) * 100)) },
  ];

  const scatterData = merged.filter(d => d.weight && d.deficit).map(d => ({ x: d.deficit, y: d.weight }));
  const currentWeight = weightLogs[weightLogs.length - 1]?.weight;
  const totalLost = weightLogs.length > 1 ? (weightLogs[0].weight - currentWeight).toFixed(1) : 0;
  const pctToGoal = weightLogs.length > 1 && goals.targetWeight
    ? Math.min(100, Math.max(0, Math.round(((weightLogs[0].weight - currentWeight) / (weightLogs[0].weight - goals.targetWeight)) * 100))) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Range selector */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[7, 14, 30].map(r => (
          <button key={r} onClick={() => setRange(r)} style={{
            padding: '8px 20px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 13, fontFamily: 'Nunito, sans-serif',
            background: range === r ? theme.primaryLight : colors.bg,
            color: range === r ? theme.primary : colors.textLight,
            border: `1.5px solid ${range === r ? theme.primaryMid : colors.border}`,
          }}>Last {r} days</button>
        ))}
      </div>

      {/* Overall progress */}
      <div style={{ background: `linear-gradient(135deg, ${theme.primaryLight}, ${theme.secondaryLight})`, borderRadius: 20, padding: 24, border: `1.5px solid ${theme.primaryMid}` }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: theme.primary, marginBottom: 16 }}>🏆 Overall Progress</div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
            <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="55" cy="55" r="45" fill="none" stroke={theme.primaryLight} strokeWidth="10" />
              <circle cx="55" cy="55" r="45" fill="none" stroke={theme.primary} strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - pctToGoal / 100)}`}
                strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: theme.primary }}>{pctToGoal}%</div>
              <div style={{ fontSize: 9, color: colors.textLight, fontWeight: 600 }}>to goal</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 14, color: colors.text }}>⚖️ Lost <strong style={{ color: theme.primary }}>{totalLost} kg</strong> so far</div>
            {goals.targetWeight && <div style={{ fontSize: 14, color: colors.text }}>🎯 Target: <strong style={{ color: theme.secondary }}>{goals.targetWeight} kg</strong></div>}
            {currentWeight && goals.targetWeight && <div style={{ fontSize: 14, color: colors.text }}>💪 <strong style={{ color: theme.accent2 }}>{Math.max(0, currentWeight - goals.targetWeight).toFixed(1)} kg</strong> to go</div>}
          </div>
        </div>
      </div>

      {/* Radar */}
      {(avgSteps > 0 || avgDeficit > 0) && (
        <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.secondaryLight}` }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: theme.secondary, marginBottom: 4 }}>🕸️ Wellness Radar</div>
          <div style={{ fontSize: 11, color: colors.textLight, marginBottom: 8 }}>Score out of 100 across all metrics</div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={theme.secondaryLight} />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: theme.secondary, fontWeight: 700 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: colors.textLight }} />
              <Radar name="Score" dataKey="value" stroke={theme.secondaryMid} fill={theme.secondaryMid} fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weight + Deficit */}
      {merged.some(d => d.weight && d.deficit) && (
        <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.primaryLight}` }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: theme.primary, marginBottom: 16 }}>📊 Weight vs Deficit</div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={merged}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.primaryLight} />
              <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 10, fill: colors.textLight }} />
              <YAxis yAxisId="left" domain={['auto', 'auto']} tick={{ fontSize: 10, fill: colors.textLight }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: colors.textLight }} />
              <Tooltip content={<Tip />} />
              <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
              <Bar yAxisId="right" dataKey="deficit" name="Deficit (kcal)" fill={theme.secondaryMid} radius={[4, 4, 0, 0]} opacity={0.7} />
              <Line yAxisId="left" type="monotone" dataKey="weight" name="Weight (kg)" stroke={theme.primary} strokeWidth={2.5} dot={{ fill: theme.primary, r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Steps + Burned */}
      {merged.some(d => d.steps && d.burned) && (
        <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.accent2Light}` }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: theme.accent2, marginBottom: 16 }}>🏃 Steps & Calories Burned</div>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={merged}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.accent2Light} />
              <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 10, fill: colors.textLight }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: colors.textLight }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: colors.textLight }} />
              <Tooltip content={<Tip />} />
              <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
              <Bar yAxisId="left" dataKey="steps" name="Steps" fill={theme.accent3Mid} radius={[4, 4, 0, 0]} opacity={0.8} />
              <Line yAxisId="right" type="monotone" dataKey="burned" name="Burned (kcal)" stroke={theme.accent2} strokeWidth={2.5} dot={{ fill: theme.accent2Mid, r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      <CalendarHeatmap weightLogs={weightLogs} calorieLogs={calorieLogs} stepLogs={stepLogs} />
      <WeeklyReport weightLogs={weightLogs} calorieLogs={calorieLogs} stepLogs={stepLogs} goals={goals} />

      {/* Scatter */}
      {scatterData.length > 1 && (
        <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.accent4Light}` }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: theme.accent4, marginBottom: 4 }}>🔬 Deficit vs Weight Correlation</div>
          <div style={{ fontSize: 11, color: colors.textLight, marginBottom: 12 }}>Higher deficit → lower weight over time</div>
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.accent4Light} />
              <XAxis dataKey="x" name="Deficit" unit=" kcal" tick={{ fontSize: 10, fill: colors.textLight }} />
              <YAxis dataKey="y" name="Weight" unit=" kg" domain={['auto', 'auto']} tick={{ fontSize: 10, fill: colors.textLight }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div style={{ background: colors.card, border: `1.5px solid ${theme.accent4Light}`, borderRadius: 12, padding: '8px 14px', fontSize: 12, fontWeight: 700 }}>
                    <div style={{ color: theme.accent4 }}>Deficit: {payload[0]?.value} kcal</div>
                    <div style={{ color: theme.primary }}>Weight: {payload[1]?.value} kg</div>
                  </div>
                );
              }} />
              <Scatter data={scatterData} fill={theme.accent4Mid} stroke={theme.accent4} strokeWidth={1.5} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
