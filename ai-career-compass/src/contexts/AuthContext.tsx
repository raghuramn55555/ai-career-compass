import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  name: string;
  email: string;
  joinDate: string;
}

interface StoredUser extends User {
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'registered_users';
const CURRENT_USER_KEY = 'current_user';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Initialize user from localStorage — only if a valid token also exists
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
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
    }
    // Clear stale session
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('tokens');
    return null;
  });

  // Backend signup
  const signupBackend = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          username: name || email.split('@')[0] // Use name as username, or email prefix if no name
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          error: data.email?.[0] || data.password?.[0] || data.username?.[0] || 'Registration failed' 
        };
      }

      const userData: User = {
        name: data.user.username || name,
        email: data.user.email,
        joinDate: new Date(data.user.join_date).toLocaleDateString(),
      };

      setUser(userData);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
      localStorage.setItem('tokens', JSON.stringify(data.tokens));

      return { success: true };
    } catch (error) {
      console.error('Backend signup error:', error);
      return { success: false, error: 'Network error. Using local storage.' };
    }
  };

  // Backend login
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
        headers: { 'Authorization': `Bearer ${data.access}` },
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

      setUser(userData);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
      localStorage.setItem('tokens', JSON.stringify({ access: data.access, refresh: data.refresh }));

      return { success: true };
    } catch (error) {
      console.error('Backend login error:', error);
      return { success: false, error: 'Network error. Using local storage.' };
    }
  };

  // Get all registered users from localStorage
  const getRegisteredUsers = (): StoredUser[] => {
    try {
      const users = localStorage.getItem(USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error loading registered users:', error);
      return [];
    }
  };

  // Save registered users to localStorage
  const saveRegisteredUsers = (users: StoredUser[]) => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving registered users:', error);
    }
  };

  // Signup function - always uses backend
  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !password || !name) return { success: false, error: 'All fields are required' };
    if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return { success: false, error: 'Invalid email format' };
    return await signupBackend(email, password, name);
  };

  // Login function - always uses backend
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !password) return { success: false, error: 'Email and password are required' };
    return await loginBackend(email, password);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('tokens');
    localStorage.removeItem('registered_users');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
