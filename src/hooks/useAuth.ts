import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

export interface AuthUser {
  id: number;
  username: string;
  name: string;
  role: 'admin' | 'manager' | 'therapist' | 'reception';
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
  can: (action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('wellness_token');
    if (token) {
      fetch('/wellness/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setUser(data); else localStorage.removeItem('wellness_token'); })
        .catch(() => localStorage.removeItem('wellness_token'))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch('/wellness/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('wellness_token', data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('wellness_token');
    setUser(null);
    window.location.reload();
  }, []);

  const hasRole = useCallback((roles: string[]) => {
    return !!user && roles.includes(user.role);
  }, [user]);

  const can = useCallback((action: string) => {
    if (!user) return false;
    const perms: Record<string, string[]> = {
      'customer.create': ['admin', 'manager', 'reception'],
      'customer.edit': ['admin', 'manager', 'reception'],
      'customer.delete': ['admin', 'manager'],
      'service.create': ['admin', 'manager', 'therapist', 'reception'],
      'service.delete': ['admin', 'manager'],
      'sale.create': ['admin', 'manager', 'reception'],
      'sale.delete': ['admin', 'manager'],
      'card.create': ['admin', 'manager', 'reception'],
      'card.delete': ['admin', 'manager'],
      'followup.create': ['admin', 'manager', 'therapist'],
      'followup.delete': ['admin', 'manager'],
      'item.create': ['admin', 'manager'],
      'item.edit': ['admin', 'manager'],
      'item.delete': ['admin', 'manager'],
      'user.manage': ['admin'],
      'setting.manage': ['admin', 'manager'],
      'export': ['admin', 'manager', 'reception'],
    };
    return (perms[action] || ['admin']).includes(user.role);
  }, [user]);

  const value = { user, isLoading, login, logout, hasRole, can };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}