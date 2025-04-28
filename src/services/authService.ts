const API_URL = process.env.REACT_APP_API_URL || 'https://startup-bp55.onrender.com/api';

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      return await res.json();
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },
  
  signup: async (email: string, password: string, name: string) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      console.log('Sending signup request to:', `${API_URL}/auth/signup`);
      console.log('With data:', { email: normalizedEmail, name });
      
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password, name }),
      });
      
      const data = await res.json();
      console.log('Signup response:', data);
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        message: 'Network error. Please check your connection and try again.' 
      };
    }
  },
  
  getMe: async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (error) {
      console.error('GetMe error:', error);
      return { success: false, message: 'Failed to fetch user information.' };
    }
  },
};