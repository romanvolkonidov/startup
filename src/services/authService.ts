const API_URL = 'https://startup-bp55.onrender.com/api';

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
};