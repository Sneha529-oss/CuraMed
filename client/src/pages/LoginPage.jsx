import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('doctor.mitchell@curamed.io');
    setPassword('CuraMed2026!');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 p-8 shadow-card space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-sm">
            <Activity className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to CuraMed
          </h2>
          <p className="text-xs text-slate-500">
            Access protected clinical risk analytics & patient assessment records
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="clinician@hospital.org"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs shadow-soft hover:shadow-card transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Demo Login Shortcut */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleDemoFill}
            className="w-full py-2.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-2xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Pre-fill Demo Clinician Credentials</span>
          </button>
        </div>

        <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-teal-600 hover:underline">
            Register for Free
          </Link>
        </div>
      </div>
    </div>
  );
};
