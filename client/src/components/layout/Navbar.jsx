import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  BarChart3, 
  Database, 
  History, 
  Cpu, 
  PlusCircle, 
  User, 
  LogOut, 
  LogIn, 
  Menu, 
  X,
  HeartPulse
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Activity },
    { name: 'Disease Predictor', path: '/predict', icon: HeartPulse },
    { name: 'Dataset Analytics', path: '/analytics', icon: Database },
    { name: 'Model Benchmarks', path: '/models', icon: Cpu },
    { name: 'History', path: '/history', icon: History },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 font-sans">
                  Cura<span className="text-teal-600">Med</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.5 rounded">
                  Clinical AI
                </span>
              </div>
              <span className="text-[10px] text-slate-400 -mt-1 font-medium">Healthcare Analytics</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-teal-50 text-teal-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/predict"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Assessment</span>
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                    {user?.full_name?.split(' ')[0] || 'Clinician'}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-elevated border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-medium text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user?.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/history"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <History className="w-4 h-4 text-slate-400" />
                      Assessment History
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  active ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/predict"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold"
            >
              <PlusCircle className="w-4 h-4" />
              New Risk Assessment
            </Link>
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-rose-600 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out ({user?.full_name})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2 text-sm font-semibold bg-teal-50 text-teal-700 rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
