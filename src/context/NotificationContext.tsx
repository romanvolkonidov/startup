import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuthContext } from './AuthContext';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  date: string;
}

interface NotificationContextType {
  notifications: Notification[];
  loading: boolean;
  error: string;
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'date'>) => Promise<any>;
  clearNotifications: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token, currentUser } = useAuthContext();

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    if (!token) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    const res = await notificationService.getNotifications(token);
    if (Array.isArray(res)) setNotifications(res);
    else setError(res.message || 'Failed to fetch notifications');
    setLoading(false);
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'date'>) => {
    setError('');
    if (!token || !currentUser) return { success: false, message: 'Not authenticated' };
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...notification, userId: currentUser.id }),
      });
      if (!res.ok) throw new Error('Failed to add notification');
      const data = await res.json();
      await fetchNotifications();
      return data;
    } catch (err) {
      setError((err as Error).message);
      return { success: false, message: (err as Error).message };
    }
  };

  const clearNotifications = () => setNotifications([]);

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, [token]);

  return (
    <NotificationContext.Provider value={useMemo(() => ({ notifications, loading, error, fetchNotifications, addNotification, clearNotifications }), [notifications, loading, error])}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotificationContext must be used within NotificationProvider');
  return context;
};
