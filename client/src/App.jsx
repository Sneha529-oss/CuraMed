import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { PredictPage } from './pages/PredictPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ModelsPage } from './pages/ModelsPage';
import { HistoryPage } from './pages/HistoryPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/predict" element={<PredictPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/models" element={<ModelsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
