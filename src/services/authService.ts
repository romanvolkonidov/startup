import axios from 'axios';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider, facebookProvider, twitterProvider } from '../firebase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('Login failed:', res.status, text);
        return { success: false, message: `HTTP ${res.status}: ${text}` };
      }
      return await res.json();
    } catch (error: unknown) {
      console.error('Login error:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Network error.' };
    }
  },
  signup: async (email: string, password: string, name: string) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const endpoint = `${API_URL}/auth/signup`;
      console.log('Signup request details:');
      console.log('- API URL:', API_URL);
      console.log('- Full endpoint:', endpoint);
      console.log('- Email:', normalizedEmail);
      console.log('- Name:', name);
      try {
        const testResponse = await fetch(endpoint, { method: 'OPTIONS' });
        console.log('API reachable:', testResponse.ok, 'Status:', testResponse.status);
      } catch (testError) {
        console.error('API not reachable:', testError);
      }
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: normalizedEmail, password, name }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('Signup failed:', res.status, text);
        return { success: false, message: `HTTP ${res.status}: ${text}` };
      }
      const data = await res.json();
      console.log('Signup response data:', data);
      return data;
    } catch (error: unknown) {
      console.error('Signup error details:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Network error.' };
    }
  },
  getMe: async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('GetMe failed:', res.status, text);
        return { success: false, message: `HTTP ${res.status}: ${text}` };
      }
      return await res.json();
    } catch (error: unknown) {
      console.error('GetMe error:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Failed to fetch user information.' };
    }
  },
  forgotPassword: async (email: string) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      return await res.json();
    } catch (error) {
      return { success: false, message: 'Network error.' };
    }
  },
  resetPassword: async (email: string, token: string, newPassword: string) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, token, newPassword }),
      });
      return await res.json();
    } catch (error) {
      return { success: false, message: 'Network error.' };
    }
  },
  
  // Firebase authentication methods
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Get the Firebase ID token
      const idToken = await result.user.getIdToken();
      return await handleFirebaseAuth(idToken);
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { success: false, message: 'Failed to sign in with Google' };
    }
  },
  
  signInWithFacebook: async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const idToken = await result.user.getIdToken();
      return await handleFirebaseAuth(idToken);
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      return { success: false, message: 'Failed to sign in with Facebook' };
    }
  },
  
  signInWithTwitter: async () => {
    try {
      const result = await signInWithPopup(auth, twitterProvider);
      const idToken = await result.user.getIdToken();
      return await handleFirebaseAuth(idToken);
    } catch (error) {
      console.error('Twitter sign-in error:', error);
      return { success: false, message: 'Failed to sign in with Twitter' };
    }
  },
  
  // For mobile-friendly authentication flow (optional)
  signInWithRedirect: async (provider: any) => {
    try {
      await signInWithRedirect(auth, provider);
      return { success: true };
    } catch (error) {
      console.error('Redirect sign-in error:', error);
      return { success: false, message: 'Failed to initiate sign-in' };
    }
  },
  
  // Handle redirect result
  handleRedirectResult: async () => {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        const idToken = await result.user.getIdToken();
        return await handleFirebaseAuth(idToken);
      }
      return null; // No redirect result
    } catch (error) {
      console.error('Handle redirect result error:', error);
      return { success: false, message: 'Failed to complete sign-in' };
    }
  }
};

// Helper function to send Firebase ID token to backend
async function handleFirebaseAuth(idToken: string) {
  try {
    const response = await axios.post(`${API_URL}/auth/firebase-login`, { idToken });
    const { data } = response;
    
    if (data.success && data.token) {
      // Store JWT token in localStorage
      localStorage.setItem('token', data.token);
      return {
        success: true,
        user: data.user,
        token: data.token
      };
    } else {
      return { success: false, message: data.message || 'Authentication failed' };
    }
  } catch (error: unknown) {
    console.error('Firebase backend authentication error:', error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Authentication server error';
      
    return {
      success: false,
      message: (error as any).response?.data?.message || errorMessage
    };
  }
}