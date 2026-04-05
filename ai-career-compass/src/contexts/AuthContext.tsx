import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';

interface User {
  name: string;
  email: string;
  joinDate: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  registerClearUserData: (fn: () => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'current_user';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const clearUserDataRef = useRef<(() => void) | null>(null);

  const registerClearUserData = (fn: () => void) => {
    clearUserDataRef.current = fn;
  };

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      const tokens = localStorage.getItem('tokens');
      if (saved && tokens) {
        const parsed = JSON.parse(saved);
        const parsedTokens = JSON.parse(tokens);
        if (parsed.email && parsed.name && parsed.joinDate && parsedTokens.access) {
          return parsed;
        }
      }
    } catch {
      // ignore parse errors
    }
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('tokens');
    return null;
  });

  const signupBackend = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username: name || email.split('@')[0] }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.email?.[0] || data.password?.[0] || data.username?.[0] || 'Registration failed' };
      }
      const userData: User = {
        name: data.user.username || name,
        email: data.user.email,
        joinDate: new Date(data.user.join_date).toLocaleDateString(),
      };
      clearUserDataRef.current?.();
      setUser(userData);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
      localStorage.setItem('tokens', JSON.stringify(data.tokens));
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  };

  const loginBackend = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.detail || 'Invalid credentials' };
      }
      const profileResponse = await fetch(`${API_URL}/auth/profile/`, {
        headers: { Authorization: `Bearer ${data.access}` },
      });
      if (!profileResponse.ok) {
        return { success: false, error: 'Failed to fetch profile' };
      }
      const profileData = await profileResponse.json();
      const userData: User = {
        name: profileData.username || profileData.email.split('@')[0],
        email: profileData.email,
        joinDate: new Date(profileData.join_date).toLocaleDateString(),
      };
      clearUserDataRef.current?.();
      setUser(userData);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
      localStorage.setItem('tokens', JSON.stringify({ access: data.access, refresh: data.refresh }));
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    if (!email || !password || !name) return { success: false, error: 'All fields are required' };
    if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { success: false, error: 'Invalid email format' };
    return signupBackend(email, password, name);
  };

  const login = async (email: string, password: string) => {
    if (!email || !password) return { success: false, error: 'Email and password are required' };
    return loginBackend(email, password);
  };

  const logout = () => {
    clearUserDataRef.current?.();
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('tokens');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user, registerClearUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
