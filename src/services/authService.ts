import axios from 'axios';
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile,
  AuthError,
  AuthErrorCodes
} from 'firebase/auth';
import { auth, googleProvider, appleProvider } from '../firebase';

const API_URL = process.env.REACT_APP_API_URL || 'https://startapp-bp55.onrender.com/api';

// Helper function to extract meaningful error messages from Firebase errors
const getFirebaseErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'code' in error) {
    const authError = error as AuthError;
    
    // Handle specific error codes with user-friendly messages
    switch(authError.code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Try logging in instead.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please check your email or sign up.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again or reset your password.';
      case 'auth/invalid-credential':
        return 'Invalid login credentials. Please check your email and password.';
      case 'auth/too-many-requests':
        return 'Too many unsuccessful login attempts. Please try again later.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was canceled because the popup was closed.';
      case 'auth/popup-blocked':
        return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
      case 'auth/operation-not-allowed':
        return 'This authentication method is not enabled. Please contact support.';
      default:
        return authError.message || 'Authentication failed. Please try again.';
    }
  }
  return 'An unexpected error occurred. Please try again.';
};

export const authService = {
  loginWithFirebase: async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();
      return await handleFirebaseAuth(idToken);
    } catch (error) {
      console.error('Firebase login error:', error);
      return { success: false, message: getFirebaseErrorMessage(error) };
    }
  },
  signupWithFirebase: async (email: string, password: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      if (user && name) {
        await updateProfile(user, { displayName: name });
      }
      const idToken = await user.getIdToken();
      return await handleFirebaseAuth(idToken);
    } catch (error) {
      console.error('Firebase signup error:', error);
      return { success: false, message: getFirebaseErrorMessage(error) };
    }
  },
  sendFirebasePasswordReset: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Firebase password reset error:', error);
      return { success: false, message: getFirebaseErrorMessage(error) };
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
      console.error('Get user profile error:', error);
      return { success: false, message: 'Failed to fetch user profile' };
    }
  },
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      return await handleFirebaseAuth(idToken);
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { success: false, message: getFirebaseErrorMessage(error) };
    }
  },
  signInWithApple: async () => {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      const idToken = await result.user.getIdToken();
      return await handleFirebaseAuth(idToken);
    } catch (error) {
      console.error('Apple sign-in error:', error);
      return { success: false, message: getFirebaseErrorMessage(error) };
    }
  },
  refreshToken: async (token: string) => {
    try {
      console.log('Calling token refresh API endpoint');
      const res = await fetch(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      
      if (!res.ok) {
        console.error(`Token refresh failed with status: ${res.status}`);
        const errorText = await res.text().catch(() => '');
        console.error('Error response:', errorText);
        return { success: false, message: 'Failed to refresh token' };
      }
      
      const data = await res.json();
      console.log('Token refresh successful');
      return { success: true, token: data.token };
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, message: 'Failed to refresh authentication token' };
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
      console.error('Server authentication failed:', data);
      return { success: false, message: data.message || 'Authentication failed' };
    }
  } catch (error) {
    console.error('Authentication server error:', error);
    if (axios.isAxiosError(error) && error.response) {
      return { 
        success: false, 
        message: error.response.data?.message || `Server error: ${error.response.status}` 
      };
    }
    return { success: false, message: 'Cannot connect to authentication server' };
  }
}