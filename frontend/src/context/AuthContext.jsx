import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('authUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Validate existing token with backend on mount
  useEffect(() => {
    async function verifySession() {
      const savedToken = localStorage.getItem('authToken');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.auth.getMe();
        if (response && response.data) {
          setUser(response.data);
          localStorage.setItem('authUser', JSON.stringify(response.data));
        }
      } catch (err) {
        // If token is invalid or expired, clear storage deliberately
        if (err.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          setToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    }

    verifySession();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res && res.token && res.user) {
      localStorage.setItem('authToken', res.token);
      localStorage.setItem('authUser', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error('Invalid login response from server');
  }, []);

  const register = useCallback(async (name, email, password) => {
    // 1. Register user
    await api.auth.register({ name, email, password });
    // 2. Automatically log in to obtain JWT
    return await login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
