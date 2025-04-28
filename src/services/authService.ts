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
      const endpoint = `${API_URL}/auth/signup`;
      
      console.log('Signup request details:');
      console.log('- API URL:', API_URL);
      console.log('- Full endpoint:', endpoint);
      console.log('- Email:', normalizedEmail);
      console.log('- Name:', name);
      
      // Test if the API is reachable with a simple OPTIONS request
      try {
        const testResponse = await fetch(endpoint, { method: 'OPTIONS' });
        console.log('API reachable:', testResponse.ok, 'Status:', testResponse.status);
      } catch (testError) {
        console.error('API not reachable:', testError);
      }
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        // Include credentials if your API requires them
        credentials: 'include',
        body: JSON.stringify({ email: normalizedEmail, password, name }),
      });
      
      console.log('Signup response status:', res.status);
      const data = await res.json();
      console.log('Signup response data:', data);
      return data;
    } catch (error) {
      console.error('Signup error details:', error);
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