import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('curamed_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('curamed_token');
      const storedUser = localStorage.getItem('curamed_user');
      
      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error('Failed to parse stored user:', e);
          }
        }
        try {
          const freshUser = await authAPI.getMe();
          setUser(freshUser);
          localStorage.setItem('curamed_user', JSON.stringify(freshUser));
        } catch (err) {
          console.warn('Session check failed or expired token:', err.message);
          // Don't log out immediately if offline, but if 401 then clear
          if (err.message.includes('401') || err.message.includes('expired') || err.message.includes('Authentication')) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authAPI.login({ email, password });
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('curamed_token', data.access_token);
    localStorage.setItem('curamed_user', JSON.stringify(data.user));
    return data;
  };

  const register = async (userData) => {
    const data = await authAPI.register(userData);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('curamed_token', data.access_token);
    localStorage.setItem('curamed_user', JSON.stringify(data.user));
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('curamed_token');
    localStorage.removeItem('curamed_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
