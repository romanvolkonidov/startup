import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  joined?: string;
  profilePicture?: string | null;
}

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  loginWithFirebase: (email: string, password: string) => Promise<any>;
  signupWithFirebase: (email: string, password: string, name: string) => Promise<any>;
  logout: () => void;
  loading: boolean;
  setToken: (token: string | null) => void;
  setCurrentUser: (user: User | null) => void;
  refreshToken: () => Promise<boolean>;
  isTokenValid: () => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Token validation function
  const isTokenValid = (): boolean => {
    if (!token) return false;
    
    try {
      // For JWT tokens, check expiration
      // This is a simple check - adjust according to your token structure
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return false;
      
      const payload = JSON.parse(atob(tokenParts[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      
      return Date.now() < expirationTime;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  };

  // Function to refresh the token
  const refreshToken = async (): Promise<boolean> => {
    try {
      console.log('Attempting to refresh token');
      if (!token) {
        console.error('No token available to refresh');
        return false;
      }
      
      const res = await authService.refreshToken(token);
      if (res.success && res.token) {
        console.log('Token refreshed successfully');
        setToken(res.token);
        localStorage.setItem('token', res.token);
        return true;
      } else {
        console.error('Failed to refresh token:', res.message);
        logout();
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      return false;
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      if (token) {
        console.log('Token found, validating...');
        
        if (!isTokenValid()) {
          console.log('Token expired, attempting refresh');
          const refreshed = await refreshToken();
          if (!refreshed) {
            console.log('Token refresh failed, logging out');
            logout();
            setLoading(false);
            return;
          }
        }
        
        console.log('Token valid, fetching user profile');
        const res = await authService.getMe(token);
        if (res && res.id) {
          console.log('User profile retrieved successfully');
          setCurrentUser(res);
        } else {
          console.error('Failed to fetch user profile:', res?.message);
          logout();
        }
      }
      setLoading(false);
    };
    
    checkUser();
  }, [token]);

  const loginWithFirebase = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authService.loginWithFirebase(email, password);
      if (res.success && res.token) {
        setToken(res.token);
        localStorage.setItem('token', res.token);
        setCurrentUser(res.user);
      }
      return res;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const signupWithFirebase = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const res = await authService.signupWithFirebase(email, password, name);
      if (res.success && res.token) {
        setToken(res.token);
        localStorage.setItem('token', res.token);
        setCurrentUser(res.user);
      }
      return res;
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Signup failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out user');
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      token, 
      loginWithFirebase, 
      signupWithFirebase, 
      logout, 
      loading, 
      setToken, 
      setCurrentUser,
      refreshToken,
      isTokenValid
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};
