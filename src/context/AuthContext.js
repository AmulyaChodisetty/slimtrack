import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const USERS_KEY = 'slimtrack_users';
const SESSION_KEY = 'slimtrack_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) setUser(JSON.parse(session));
    setLoading(false);
  }, []);

  const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

  const signup = async (data) => {
    const users = getUsers();
    if (users.find(u => u.email === data.email)) { const e = new Error('Email already registered'); e.response = { data: { error: 'Email already registered' } }; throw e; }
    const newUser = { ...data, id: Date.now() };
    saveUsers([...users, newUser]);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const login = async (email, password) => {
    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) { const e = new Error('Invalid email or password'); e.response = { data: { error: 'Invalid email or password' } }; throw e; }
    localStorage.setItem(SESSION_KEY, JSON.stringify(found));
    setUser(found);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const updated = { ...user, ...data };
    const users = getUsers().map(u => u.id === user.id ? updated : u);
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
