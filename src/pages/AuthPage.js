import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ForgotPassword from './ForgotPassword';

export default function AuthPage() {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState('login');
  const [showForgot, setShowForgot] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '', height: '', gender: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (tab === 'login') await login(form.email, form.password);
      else await signup(form);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fce7f3 0%, #ede9fe 50%, #dbeafe 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🌸</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#ec4899' }}>SlimTrack</div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Your personal wellness companion</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 8px 40px rgba(196,181,253,0.25)' }}>

          <AnimatePresence mode="wait">
            {showForgot ? (
              <motion.div key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ForgotPassword onBack={() => setShowForgot(false)} />
              </motion.div>
            ) : (
              <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Tabs */}
                <div style={{ display: 'flex', background: '#f3e8ff', borderRadius: 14, padding: 4, marginBottom: 24 }}>
                  {['login', 'signup'].map(t => (
                    <button key={t} onClick={() => { setTab(t); setError(''); }} style={{
                      flex: 1, padding: '10px', borderRadius: 11, border: 'none', cursor: 'pointer',
                      fontWeight: 700, fontSize: 14, fontFamily: 'Nunito, sans-serif',
                      background: tab === t ? '#fff' : 'transparent',
                      color: tab === t ? '#ec4899' : '#9ca3af',
                      boxShadow: tab === t ? '0 2px 8px rgba(196,181,253,0.3)' : 'none',
                      transition: 'all 0.2s',
                    }}>
                      {t === 'login' ? '🔑 Login' : '✨ Sign Up'}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {tab === 'signup' && (
                    <div>
                      <label style={labelStyle}>Full Name</label>
                      <input placeholder="Your name" value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle} required />
                    </div>
                  )}
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} style={inputStyle} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Password</label>
                    <input type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} style={inputStyle} required />
                  </div>
                  {tab === 'signup' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={labelStyle}>Age</label>
                        <input type="number" placeholder="25" value={form.age} onChange={e => set('age', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Height (cm)</label>
                        <input type="number" placeholder="165" value={form.height} onChange={e => set('height', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Gender</label>
                        <select value={form.gender} onChange={e => set('gender', e.target.value)} style={inputStyle}>
                          <option value="">—</option>
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {error && <div style={{ background: '#fee2e2', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ef4444', fontWeight: 600 }}>⚠️ {error}</div>}

                  <button type="submit" disabled={loading} style={{
                    padding: '14px', borderRadius: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 800, fontSize: 15, fontFamily: 'Nunito, sans-serif',
                    background: loading ? '#f3e8ff' : 'linear-gradient(135deg, #f9a8d4, #ec4899)',
                    color: loading ? '#9ca3af' : '#fff', marginTop: 4, transition: 'all 0.2s',
                  }}>
                    {loading ? '...' : tab === 'login' ? '🔑 Login' : '🌸 Create Account'}
                  </button>

                  {tab === 'login' && (
                    <button type="button" onClick={() => setShowForgot(true)} style={{
                      background: 'none', border: 'none', color: '#9ca3af', fontSize: 12,
                      fontWeight: 600, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', textAlign: 'center',
                    }}>
                      Forgot password?
                    </button>
                  )}
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 700, color: '#9ca3af', marginBottom: 6 };
const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid #f3e8ff', fontSize: 13, fontFamily: 'Nunito, sans-serif', color: '#4a4063', outline: 'none', background: '#fdf6ff', boxSizing: 'border-box' };
