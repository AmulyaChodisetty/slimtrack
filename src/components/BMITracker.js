import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const ZONES = [
  { label: 'Underweight', min: 10,   max: 18.5, color: '#3b82f6', emoji: '🔵' },
  { label: 'Normal',      min: 18.5, max: 25,   color: '#10b981', emoji: '🟢' },
  { label: 'Overweight',  min: 25,   max: 30,   color: '#f59e0b', emoji: '🟡' },
  { label: 'Obese',       min: 30,   max: 45,   color: '#ef4444', emoji: '🔴' },
];

const SCALE_MIN = 10;
const SCALE_MAX = 45;
const SCALE_RANGE = SCALE_MAX - SCALE_MIN;

const getBMICategory = (bmi) => {
  return ZONES.find(z => bmi >= z.min && bmi < z.max) || ZONES[ZONES.length - 1];
};

const getPct = (val) => Math.min(100, Math.max(0, ((val - SCALE_MIN) / SCALE_RANGE) * 100));

export default function BMITracker({ weightLogs, height }) {
  const { theme, colors } = useTheme();

  if (!height || weightLogs.length === 0) return (
    <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.primaryLight}`, textAlign: 'center' }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>📏</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: theme.primary, marginBottom: 4 }}>BMI Tracker</div>
      <div style={{ fontSize: 12, color: colors.textLight }}>
        {!height ? 'Add your height in Profile → Edit to track BMI' : 'Log your weight to see BMI trends'}
      </div>
    </div>
  );

  const h = parseFloat(height) / 100;
  const bmiData = weightLogs.map(l => ({
    date: l.date,
    bmi: parseFloat((l.weight / (h * h)).toFixed(1)),
  }));

  const currentBMI = bmiData[bmiData.length - 1]?.bmi;
  const category = getBMICategory(currentBMI);
  const firstBMI = bmiData[0]?.bmi;
  const bmiChange = bmiData.length > 1 ? (currentBMI - firstBMI).toFixed(1) : null;
  const pointerPct = getPct(currentBMI);

  return (
    <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.primaryLight}` }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: theme.primary, marginBottom: 16 }}>📏 BMI Tracker</div>

      {/* Current BMI + change */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ background: `${category.color}18`, borderRadius: 16, padding: '16px 20px', flex: 1, border: `1.5px solid ${category.color}55` }}>
          <div style={{ fontSize: 11, color: colors.textLight, fontWeight: 600, marginBottom: 4 }}>Current BMI</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: category.color, lineHeight: 1 }}>{currentBMI}</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: category.color, marginTop: 6 }}>{category.emoji} {category.label}</div>
        </div>
        {bmiChange !== null && (
          <div style={{ background: colors.bg, borderRadius: 16, padding: '16px 20px', flex: 1, border: `1.5px solid ${colors.border}` }}>
            <div style={{ fontSize: 11, color: colors.textLight, fontWeight: 600, marginBottom: 4 }}>Change</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: parseFloat(bmiChange) <= 0 ? '#10b981' : '#ef4444', lineHeight: 1 }}>
              {parseFloat(bmiChange) > 0 ? '+' : ''}{bmiChange}
            </div>
            <div style={{ fontSize: 12, color: colors.textLight, marginTop: 6 }}>since start</div>
          </div>
        )}
      </div>

      {/* Visual BMI zone bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: colors.textLight, marginBottom: 10 }}>BMI SCALE</div>

        {/* Zone segments */}
        <div style={{ position: 'relative', marginBottom: 28 }}>
          <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', height: 20 }}>
            {ZONES.map(z => (
              <div key={z.label} style={{
                flex: z.max - z.min,
                background: z.color,
                opacity: category.label === z.label ? 1 : 0.3,
                transition: 'opacity 0.3s',
              }} />
            ))}
          </div>

          {/* Pointer */}
          <div style={{
            position: 'absolute',
            left: `${pointerPct}%`,
            top: -6,
            transform: 'translateX(-50%)',
          }}>
            <div style={{
              width: 4, height: 32, background: '#1f2937',
              borderRadius: 2, margin: '0 auto',
            }} />
            <div style={{
              background: '#1f2937', color: '#fff',
              fontSize: 10, fontWeight: 800, padding: '2px 6px',
              borderRadius: 6, whiteSpace: 'nowrap',
              transform: 'translateX(-50%)', marginLeft: 2,
              marginTop: 2,
            }}>
              {currentBMI}
            </div>
          </div>

          {/* Zone boundary labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, paddingTop: 20 }}>
            {[10, 18.5, 25, 30, 45].map(v => (
              <span key={v} style={{ fontSize: 9, color: colors.textLight, fontWeight: 600 }}>{v}</span>
            ))}
          </div>
        </div>

        {/* Zone legend cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {ZONES.map(z => (
            <div key={z.label} style={{
              background: category.label === z.label ? `${z.color}22` : colors.bg,
              border: `1.5px solid ${category.label === z.label ? z.color : colors.border}`,
              borderRadius: 10, padding: '8px 6px', textAlign: 'center',
              transition: 'all 0.3s',
            }}>
              <div style={{ fontSize: 16, marginBottom: 2 }}>{z.emoji}</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: category.label === z.label ? z.color : colors.textLight }}>
                {z.label}
              </div>
              <div style={{ fontSize: 9, color: colors.textLight, marginTop: 2 }}>
                {z.min}–{z.max === 45 ? '40+' : z.max}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      {bmiData.length > 1 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: colors.textLight, marginBottom: 10 }}>BMI OVER TIME</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={bmiData}>
              <defs>
                <linearGradient id="bmiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.primaryMid} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={theme.primaryMid} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.primaryLight} />
              <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 10, fill: colors.textLight }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: colors.textLight }} />
              <Tooltip content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const cat = getBMICategory(payload[0].value);
                return (
                  <div style={{ background: colors.card, border: `1.5px solid ${theme.primaryLight}`, borderRadius: 12, padding: '8px 14px', fontSize: 12, fontWeight: 700 }}>
                    <div style={{ color: colors.textLight }}>{fmt(label)}</div>
                    <div style={{ color: cat.color }}>{cat.emoji} BMI: {payload[0].value} — {cat.label}</div>
                  </div>
                );
              }} />
              <ReferenceLine y={18.5} stroke="#3b82f6" strokeDasharray="4 4" strokeOpacity={0.5} />
              <ReferenceLine y={25}   stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.5} />
              <ReferenceLine y={30}   stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.5} />
              <Area type="monotone" dataKey="bmi" stroke={theme.primary} fill="url(#bmiGrad)" strokeWidth={2.5} dot={{ fill: theme.primary, r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
