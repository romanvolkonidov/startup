const API_BASE_URL = 'http://localhost:5000/api';

export const authService = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return await res.json();
  },
  signup: async (email: string, password: string, name: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    return await res.json();
  },
  getMe: async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  },
  logout: async () => {
    // For JWT, logout is client-side (just remove token)
    return { success: true };
  },
};