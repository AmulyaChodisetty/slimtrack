import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import PageWrapper from './components/PageWrapper';
import InstallPrompt from './components/InstallPrompt';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import LogDay from './pages/LogDay';
import WeightLog from './pages/WeightLog';
import Calories from './pages/Calories';
import Steps from './pages/Steps';
import Progress from './pages/Progress';
import Goals from './pages/Goals';
import Profile from './pages/Profile';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/log" element={<PageWrapper><LogDay /></PageWrapper>} />
        <Route path="/weight" element={<PageWrapper><WeightLog /></PageWrapper>} />
        <Route path="/calories" element={<PageWrapper><Calories /></PageWrapper>} />
        <Route path="/steps" element={<PageWrapper><Steps /></PageWrapper>} />
        <Route path="/progress" element={<PageWrapper><Progress /></PageWrapper>} />
        <Route path="/goals" element={<PageWrapper><Goals /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fce7f3, #ede9fe)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌸</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#ec4899' }}>Loading SlimTrack...</div>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <AppProvider>
      <Layout>
        <AnimatedRoutes />
      </Layout>
      <InstallPrompt />
    </AppProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
