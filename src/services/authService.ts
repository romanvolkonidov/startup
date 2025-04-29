import axios from 'axios';
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile 
} from 'firebase/auth';
import { auth, googleProvider, appleProvider } from '../firebase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const authService = {
  loginWithFirebase: async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();
      return await handleFirebaseAuth(idToken);
    } catch (error) {
      console.error('Firebase login error:', error);
      return { success: false, message: 'Failed to log in with Firebase' };
    }
  },
  signupWithFirebase: async (email: string, password: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      if (user && name) {
        // Use the imported updateProfile function instead of a method on user
        await updateProfile(user, { displayName: name });
      }
      const idToken = await user.getIdToken();
      return await handleFirebaseAuth(idToken);
    } catch (error) {
      console.error('Firebase signup error:', error);
      return { success: false, message: 'Failed to sign up with Firebase' };
    }
  },
  sendFirebasePasswordReset: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Firebase password reset error:', error);
      return { success: false, message: 'Failed to send password reset email' };
    }
  },
  getMe: async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return { success: false };
      return await res.json();
    } catch (error) {
      return { success: false };
    }
  },
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      return await handleFirebaseAuth(idToken);
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { success: false, message: 'Failed to sign in with Google' };
    }
  },
  signInWithApple: async () => {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      const idToken = await result.user.getIdToken();
      return await handleFirebaseAuth(idToken);
    } catch (error) {
      console.error('Apple sign-in error:', error);
      return { success: false, message: 'Failed to sign in with Apple' };
    }
  }
};

async function handleFirebaseAuth(idToken: string) {
  try {
    const response = await axios.post(`${API_URL}/auth/firebase-login`, { idToken });
    const { data } = response;
    if (data.success && data.token) {
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
    return { success: false, message: 'Authentication server error' };
  }
}