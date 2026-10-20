import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

const fmt = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
});

export default function LogDay() {
  const { weightLogs, calorieLogs, stepLogs, biweeklyNotes, goals,
    addWeightLog, addCalorieLog, addStepLog, addBiweeklyNote, today, getByDate } = useApp();
  const { theme, colors } = useTheme();

  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState('');
  const [weightNote, setWeightNote] = useState('');
  const [intake, setIntake] = useState('');
  const [burned, setBurned] = useState('');
  const [steps, setSteps] = useState('');
  const [bwNote, setBwNote] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const w = getByDate(weightLogs, date);
    const c = getByDate(calorieLogs, date);
    const s = getByDate(stepLogs, date);
    setWeight(w?.weight ?? '');
    setWeightNote(w?.note ?? '');
    setIntake(c?.intake ?? '');
    setBurned(c?.burned ?? '');
    setSteps(s?.steps ?? '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, weightLogs, calorieLogs, stepLogs]);

  const handleSave = (e) => {
    e.preventDefault();
    if (weight) addWeightLog({ date, weight: parseFloat(weight), note: weightNote });
    if (intake) addCalorieLog({ date, intake: parseInt(intake), burned: parseInt(burned || 0) });
    if (steps) addStepLog({ date, steps: parseInt(steps) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleBwNote = (e) => {
    e.preventDefault();
    if (!bwNote || !weight) return;
    addBiweeklyNote({ date, weight: parseFloat(weight), note: bwNote });
    setBwNote('');
  };

  const deficit = intake && burned && goals.dailyCalories
    ? parseInt(burned) + (parseInt(goals.dailyCalories) - parseInt(intake)) : null;
  const stepPct = steps && goals.dailySteps
    ? Math.min(100, Math.round((parseInt(steps) / parseInt(goals.dailySteps)) * 100)) : 0;
  const calPct = intake && goals.dailyCalories
    ? Math.min(100, Math.round((parseInt(intake) / parseInt(goals.dailyCalories)) * 100)) : 0;

  const allDates = [...new Set([
    ...weightLogs.map(l => l.date),
    ...calorieLogs.map(l => l.date),
    ...stepLogs.map(l => l.date),
  ])].sort((a, b) => b.localeCompare(a));

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 12,
    border: `1.5px solid ${theme.primaryLight}`, fontSize: 13, fontFamily: 'Nunito, sans-serif',
    color: colors.text, outline: 'none', background: colors.bg, boxSizing: 'border-box',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Date picker */}
      <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.primaryLight}` }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: theme.primary, marginBottom: 10 }}>📅 Select Date</div>
        <input type="date" value={date} max={today} onChange={e => setDate(e.target.value)}
          style={{ ...inputStyle, maxWidth: 220 }} />
        <div style={{ fontSize: 13, color: colors.textLight, marginTop: 8, fontWeight: 600 }}>{fmt(date)}</div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Weight */}
        <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.primaryLight}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: theme.primary }}>⚖️ Weight</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle(colors)}>Weight (kg)</label>
              <input type="number" step="0.1" placeholder="e.g. 78.5" value={weight} onChange={e => setWeight(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle(colors)}>Note (optional)</label>
              <input type="text" placeholder="How are you feeling?" value={weightNote} onChange={e => setWeightNote(e.target.value)} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Calories */}
        <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.accent1Light}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: theme.accent1 }}>🔥 Calories</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle(colors)}>Intake (kcal)</label>
              <input type="number" placeholder="e.g. 1800" value={intake} onChange={e => setIntake(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle(colors)}>Burned (kcal)</label>
              <input type="number" placeholder="e.g. 400" value={burned} onChange={e => setBurned(e.target.value)} style={inputStyle} />
            </div>
          </div>
          {(intake || burned) && (
            <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
              {intake && goals.dailyCalories && (
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: colors.textLight, fontWeight: 600 }}>vs Goal</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: calPct > 100 ? '#ef4444' : theme.accent2 }}>{calPct}%</span>
                  </div>
                  <div style={{ background: theme.accent1Light, borderRadius: 20, height: 6, overflow: 'hidden' }}>
                    <div style={{ background: calPct > 100 ? '#ef4444' : theme.accent1Mid, height: '100%', width: `${Math.min(calPct, 100)}%`, borderRadius: 20 }} />
                  </div>
                </div>
              )}
              {deficit !== null && (
                <div style={{ background: deficit >= 0 ? theme.accent2Light : '#fee2e2', borderRadius: 12, padding: '6px 14px', fontSize: 12, fontWeight: 800, color: deficit >= 0 ? theme.accent2 : '#ef4444' }}>
                  {deficit >= 0 ? '📉' : '📈'} Deficit: {deficit > 0 ? '+' : ''}{deficit} kcal
                </div>
              )}
            </div>
          )}
        </div>

        {/* Steps */}
        <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.accent3Light}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: theme.accent3 }}>👟 Steps</div>
          <div>
            <label style={labelStyle(colors)}>Steps taken</label>
            <input type="number" placeholder="e.g. 8500" value={steps} onChange={e => setSteps(e.target.value)} style={{ ...inputStyle, maxWidth: 220 }} />
          </div>
          {steps && goals.dailySteps && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: colors.textLight, fontWeight: 600 }}>
                  {parseInt(steps).toLocaleString()} / {parseInt(goals.dailySteps).toLocaleString()} steps
                </span>
                <span style={{ fontSize: 11, fontWeight: 800, color: theme.accent3 }}>{stepPct}%</span>
              </div>
              <div style={{ background: theme.accent3Light, borderRadius: 20, height: 8, overflow: 'hidden' }}>
                <div style={{ background: stepPct >= 100 ? theme.accent2Mid : theme.accent3Mid, height: '100%', width: `${stepPct}%`, borderRadius: 20, transition: 'width 0.3s' }} />
              </div>
              {stepPct >= 100 && <div style={{ fontSize: 12, color: theme.accent2, fontWeight: 700, marginTop: 6 }}>🎉 Goal reached!</div>}
            </div>
          )}
        </div>

        <button type="submit" style={{ padding: '13px', borderRadius: 14, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 14, fontFamily: 'Nunito, sans-serif', background: `linear-gradient(135deg, ${theme.primaryMid}, ${theme.primary})`, color: '#fff' }}>
          {saved ? '✅ Saved!' : `Save ${fmt(date).split(',')[0]}'s Log 🌸`}
        </button>
      </form>

      {/* Biweekly note */}
      <form onSubmit={handleBwNote} style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.secondaryLight}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: theme.secondary }}>📝 Biweekly Check-in Note</div>
        <div style={{ fontSize: 12, color: colors.textLight }}>Add a note every 2 weeks to track your progress story</div>
        <textarea placeholder="How's your progress? Any changes in how you feel?"
          value={bwNote} onChange={e => setBwNote(e.target.value)}
          style={{ ...inputStyle, height: 80, resize: 'vertical' }} />
        <button type="submit" style={{ padding: '12px', borderRadius: 14, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 14, fontFamily: 'Nunito, sans-serif', background: `linear-gradient(135deg, ${theme.secondaryMid}, ${theme.secondary})`, color: '#fff' }}>
          Save Check-in 💜
        </button>
      </form>

      {/* Past biweekly notes */}
      {biweeklyNotes.length > 0 && (
        <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.secondaryLight}` }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: theme.secondary, marginBottom: 14 }}>💜 Check-in History</div>
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

      {/* Daily ledger */}
      {allDates.length > 0 && (
        <div style={{ background: colors.card, borderRadius: 20, padding: 20, border: `1.5px solid ${theme.secondaryLight}` }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: colors.text, marginBottom: 14 }}>📋 Daily Ledger</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {allDates.map((d) => {
              const w = getByDate(weightLogs, d);
              const c = getByDate(calorieLogs, d);
              const s = getByDate(stepLogs, d);
              const def = c && goals.dailyCalories ? c.burned + (parseInt(goals.dailyCalories) - c.intake) : null;
              return (
                <div key={d} onClick={() => setDate(d)} style={{
                  padding: '12px 16px', borderRadius: 14, cursor: 'pointer',
                  background: d === date ? theme.primaryLight : d === today ? colors.bg : colors.bg,
                  border: `1.5px solid ${d === date ? theme.primaryMid : colors.border}`,
                  transition: 'all 0.15s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: d === today ? theme.primary : colors.text }}>
                      {d === today ? '📍 Today' : fmt(d)}
                    </span>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, fontWeight: 700 }}>
                      {w && <span style={{ color: theme.primary }}>⚖️ {w.weight} kg</span>}
                      {c && <span style={{ color: theme.accent1 }}>🔥 {c.intake} kcal</span>}
                      {c && <span style={{ color: theme.accent2 }}>💪 {c.burned} kcal</span>}
                      {def !== null && <span style={{ color: def >= 0 ? theme.secondary : '#ef4444' }}>📉 {def > 0 ? '+' : ''}{def}</span>}
                      {s && <span style={{ color: theme.accent3 }}>👟 {s.steps.toLocaleString()}</span>}
                    </div>
                  </div>
                  {w?.note && <div style={{ fontSize: 11, color: colors.textLight, marginTop: 4 }}>💬 {w.note}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = (colors) => ({ display: 'block', fontSize: 12, fontWeight: 700, color: colors.textLight, marginBottom: 6 });
