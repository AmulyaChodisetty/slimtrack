import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE = 'service_0894o7z';
const EMAILJS_TEMPLATE = 'template_qw0ofki';
const EMAILJS_PUBLIC_KEY = 'ZS7WjL-KGSfqyLgsg';

const OTP_KEY = 'slimtrack_otp';
const USERS_KEY = 'slimtrack_users';

export default function ForgotPassword({ onBack }) {
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (!users.find(u => u.email === email)) {
      setError('No account found with this email');
      return;
    }
    setLoading(true);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    localStorage.setItem(OTP_KEY, JSON.stringify({ email, code, expires: Date.now() + 5 * 60 * 1000 }));
    try {
      await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, { to_email: email, otp: code }, EMAILJS_PUBLIC_KEY);
      setSuccess('OTP sent to your email! Check your inbox.');
      setStep(2);
    } catch {
      setError('Failed to send OTP email. Please try again.');
      localStorage.removeItem(OTP_KEY);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    const stored = JSON.parse(localStorage.getItem(OTP_KEY) || '{}');
    if (!stored.code) { setError('OTP expired. Please request a new one.'); return; }
    if (Date.now() > stored.expires) { setError('OTP expired. Please request a new one.'); localStorage.removeItem(OTP_KEY); return; }
    if (stored.email !== email || stored.code !== otp) { setError('Invalid OTP. Please try again.'); return; }
    setSuccess('OTP verified! Set your new password 🔐');
    setStep(3);
  };

  const handleReset = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const updated = users.map(u => u.email === email ? { ...u, password: newPassword } : u);
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    localStorage.removeItem(OTP_KEY);
    setSuccess('Password reset successfully! 🎉');
    setTimeout(() => onBack(), 1500);
  };

  const steps = ['Email', 'OTP', 'New Password'];

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 12,
    border: `1.5px solid ${theme.primaryLight}`, fontSize: 13,
    fontFamily: 'Nunito, sans-serif', color: '#4a4063',
    outline: 'none', background: '#fdf6ff', boxSizing: 'border-box',
  };
  const btnStyle = {
    padding: '13px', borderRadius: 14, border: 'none', cursor: 'pointer',
    fontWeight: 800, fontSize: 14, fontFamily: 'Nunito, sans-serif',
    background: `linear-gradient(135deg, ${theme.primaryMid}, ${theme.primary})`, color: '#fff',
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800,
                background: step > i + 1 ? theme.primary : step === i + 1 ? theme.primaryLight : '#f3e8ff',
                color: step > i + 1 ? '#fff' : step === i + 1 ? theme.primary : '#9ca3af',
                border: `2px solid ${step === i + 1 ? theme.primary : 'transparent'}`,
              }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 10, color: step === i + 1 ? theme.primary : '#9ca3af', fontWeight: 600 }}>{s}</span>
            </div>
            {i < 2 && <div style={{ width: 32, height: 2, background: step > i + 1 ? theme.primary : '#f3e8ff', marginBottom: 16, borderRadius: 2 }} />}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.form key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📧</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#4a4063' }}>Enter your email</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>We'll send an OTP to your email</div>
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required />
            </div>
            {error && <div style={errorStyle}>⚠️ {error}</div>}
            <button type="submit" disabled={loading} style={btnStyle}>{loading ? 'Sending...' : 'Send OTP 📧'}</button>
          </motion.form>
        )}

        {step === 2 && (
          <motion.form key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔢</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#4a4063' }}>Enter OTP</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>For account: <strong>{email}</strong></div>
            </div>
            {success && (
              <div style={{ background: '#d1fae5', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#059669', fontWeight: 600 }}>
                ✅ {success}
              </div>
            )}
            <div>
              <label style={labelStyle}>6-Digit OTP</label>
              <input type="text" placeholder="123456" maxLength={6} value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                style={{ ...inputStyle, textAlign: 'center', fontSize: 24, fontWeight: 800, letterSpacing: 8 }} required />
            </div>
            {error && <div style={errorStyle}>⚠️ {error}</div>}
            <button type="submit" style={btnStyle}>Verify OTP ✓</button>
            <button type="button" onClick={() => { setStep(1); setError(''); setSuccess(''); }}
              style={{ ...btnStyle, background: theme.secondaryLight, color: theme.secondary }}>← Back</button>
          </motion.form>
        )}

        {step === 3 && (
          <motion.form key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔐</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#4a4063' }}>New Password</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Choose a strong password</div>
            </div>
            {success && <div style={{ background: '#d1fae5', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#059669', fontWeight: 600 }}>✅ {success}</div>}
            <div>
              <label style={labelStyle}>New Password</label>
              <input type="password" placeholder="Min 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input type="password" placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} required />
            </div>
            {error && <div style={errorStyle}>⚠️ {error}</div>}
            <button type="submit" style={btnStyle}>Reset Password 🌸</button>
          </motion.form>
        )}
      </AnimatePresence>

      <button onClick={onBack} style={{ width: '100%', marginTop: 12, padding: '10px', borderRadius: 12, border: 'none', background: 'transparent', color: '#9ca3af', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
        ← Back to Login
      </button>
    </motion.div>
  );
}

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 700, color: '#9ca3af', marginBottom: 6 };
const errorStyle = { background: '#fee2e2', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ef4444', fontWeight: 600 };
