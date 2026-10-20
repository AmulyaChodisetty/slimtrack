import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const AppContext = createContext();
const today = new Date().toISOString().split('T')[0];

const key = (userId, type) => `slimtrack_${userId}_${type}`;

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [weightLogs, setWeightLogs] = useState([]);
  const [calorieLogs, setCalorieLogs] = useState([]);
  const [stepLogs, setStepLogs] = useState([]);
  const [biweeklyNotes, setBiweeklyNotes] = useState([]);
  const [goals, setGoalsState] = useState({ targetWeight: '', dailyCalories: '', dailySteps: '', targetDate: '' });

  const load = useCallback(() => {
    if (!user) return;
    const get = (type) => JSON.parse(localStorage.getItem(key(user.id, type)) || '[]');
    setWeightLogs(get('weight'));
    setCalorieLogs(get('calories'));
    setStepLogs(get('steps'));
    setBiweeklyNotes(get('biweekly'));
    setGoalsState(JSON.parse(localStorage.getItem(key(user.id, 'goals')) || '{"targetWeight":"","dailyCalories":"","dailySteps":"","targetDate":""}'));
  }, [user]);

  useEffect(() => {
    if (user) load();
    else {
      setWeightLogs([]); setCalorieLogs([]); setStepLogs([]);
      setBiweeklyNotes([]); setGoalsState({ targetWeight: '', dailyCalories: '', dailySteps: '', targetDate: '' });
    }
  }, [user, load]);

  const save = (type, data) => localStorage.setItem(key(user.id, type), JSON.stringify(data));

  const upsert = (setter, type, entry) =>
    setter(prev => {
      const idx = prev.findIndex(l => l.date === entry.date);
      let next;
      if (idx >= 0) { next = [...prev]; next[idx] = { ...next[idx], ...entry }; }
      else next = [...prev, entry].sort((a, b) => a.date.localeCompare(b.date));
      save(type, next);
      return next;
    });

  const addWeightLog = (entry) => upsert(setWeightLogs, 'weight', entry);
  const addCalorieLog = (entry) => upsert(setCalorieLogs, 'calories', entry);
  const addStepLog = (entry) => upsert(setStepLogs, 'steps', entry);

  const addBiweeklyNote = (note) =>
    setBiweeklyNotes(prev => {
      const next = [...prev, note];
      save('biweekly', next);
      return next;
    });

  const setGoals = (g) => {
    save('goals', g);
    setGoalsState(g);
  };

  const getByDate = (logs, date) => logs.find(l => l.date === date);

  return (
    <AppContext.Provider value={{
      weightLogs, calorieLogs, stepLogs, biweeklyNotes,
      goals, setGoals, today, getByDate,
      addWeightLog, addCalorieLog, addStepLog, addBiweeklyNote,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
