import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, name: string) => Promise<any>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      if (token) {
        const res = await authService.getMe(token);
        if (res && res.id) setCurrentUser(res);
        else logout();
      }
      setLoading(false);
    };
    checkUser();
    // eslint-disable-next-line
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    if (res.success && res.token) {
      setToken(res.token);
      localStorage.setItem('token', res.token);
      setCurrentUser(res.user);
    }
    return res;
  };

  const signup = async (email: string, password: string, name: string) => {
    const res = await authService.signup(email, password, name);
    if (res.success && res.token) {
      setToken(res.token);
      localStorage.setItem('token', res.token);
      setCurrentUser(res.user);
    }
    return res;
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ currentUser, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};
