const API_BASE_URL = 'http://localhost:5000/api';

export const notificationService = {
  getNotifications: async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return await res.json();
    } catch (err) {
      return { success: false, message: (err as Error).message };
    }
  },
  markAsRead: async (id: string, token: string) => {
    // Not implemented in backend, just a stub for now
    return { success: true };
  },
};