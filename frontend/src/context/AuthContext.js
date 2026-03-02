import React, { createContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { saveToken, clearToken, parseJwt, getToken } from '../services/authService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // read initial user from localStorage synchronously so ProtectedRoute
  // doesn't redirect before context is populated.
  const [user, setUser] = useState(() => {
    const token = getToken();
    // If token exists, check expiry before trusting stored user
    if (token) {
      const payload = parseJwt(token);
      const now = Math.floor(Date.now() / 1000);
      if (!payload || (payload.exp && payload.exp < now)) {
        // Token is expired or unreadable — clear everything immediately
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
      }
    }
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (!u.role) u.role = 'ADMIN';
        return u;
      } catch { }
    }
    if (token) {
      const payload = parseJwt(token);
      if (payload) {
        return {
          id: payload.user_id,
          email: payload.email,
          role: payload.role || 'ADMIN',
        };
      }
    }
    return null;
  });

  useEffect(() => {
    // Listen for 401 responses from api.js and auto-logout
    const handleUnauthorized = () => {
      clearToken();
      localStorage.removeItem('user');
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    // remove any stale token before contacting login endpoint
    clearToken();
    const data = await api.login(email, password);
    saveToken(data.token);
    const id = data.user_id || parseJwt(data.token)?.user_id;
    const mail = data.email || parseJwt(data.token)?.email;
    // if server didn't return a role (e.g. superuser created without one), assume ADMIN
    const role = data.role || parseJwt(data.token)?.role || 'ADMIN';
    const userObj = { id, email: mail, role };
    setUser(userObj);
    localStorage.setItem('user', JSON.stringify(userObj));
    return data;
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
