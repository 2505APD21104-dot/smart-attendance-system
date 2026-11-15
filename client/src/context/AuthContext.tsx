import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'faculty' | 'student';
  firstName: string;
  lastName: string;
  avatar?: string;
  roleDetails?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (login: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  quickLoginAs: (role: 'admin' | 'faculty' | 'student') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('attendance_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem('attendance_token');
      if (savedToken) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (err) {
          console.error('Session expired or invalid:', err);
          localStorage.removeItem('attendance_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const login = async (loginId: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      const res = await api.login({ login: loginId, password, rememberMe });
      localStorage.setItem('attendance_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const quickLoginAs = async (role: 'admin' | 'faculty' | 'student') => {
    let creds = { login: 'admin@apex.edu', password: 'Admin@123' };
    if (role === 'faculty') {
      creds = { login: 'robert.chen@apex.edu', password: 'Faculty@123' };
    } else if (role === 'student') {
      creds = { login: 'alex.j@apex.edu', password: 'Student@123' };
    }
    await login(creds.login, creds.password);
  };

  const logout = () => {
    localStorage.removeItem('attendance_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        quickLoginAs
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
