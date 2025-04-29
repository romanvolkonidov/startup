// Basic user service stub
// Use environment variable with fallback to production URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://startapp-bp55.onrender.com/api';

export const userService = {
  getUser: async () => {
    // TODO: Fetch user profile
    return null;
  },
  updateUser: async (user: { email: string; bio: string }) => {
    // TODO: Update user profile
    return { success: true };
  },
  getUserById: async (userId: string, token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch user profile');
      return await res.json();
    } catch (err) {
      return { success: false, message: (err as Error).message };
    }
  },
};