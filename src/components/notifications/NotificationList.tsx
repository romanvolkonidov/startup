import React from 'react';
import styles from '../../styles/components/Form.module.css';

const NotificationList: React.FC = React.memo(() => {
  // Dummy notifications for demonstration
  const notifications = [
    { id: 1, message: 'Your project has received a new investment!', type: 'success', date: '2025-04-27' },
    { id: 2, message: 'Profile updated successfully.', type: 'info', date: '2025-04-26' },
    { id: 3, message: 'Commission fee has been deducted from your payment.', type: 'warning', date: '2025-04-25' },
  ];

  const getColor = (type: string) => {
    switch (type) {
      case 'success': return '#43a047'; // Green
      case 'info': return '#1e88e5'; // Blue
      case 'warning': return '#e65100'; // Orange
      case 'error': return '#d32f2f'; // Red
      default: return '#333';
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox} style={{ maxWidth: 520 }}>
        <h1 className={styles.brandTitle}>Notifications</h1>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {notifications.map(n => (
            <li key={n.id} style={{
              background: '#f7f7f7',
              borderLeft: `5px solid ${getColor(n.type)}`,
              borderRadius: 8,
              marginBottom: 16,
              padding: '16px 18px',
              color: '#222',
              boxShadow: '0 2px 8px rgba(44, 62, 80, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}>
              <span style={{ fontWeight: 500 }}>{n.message}</span>
              <span style={{ color: '#757575', fontSize: 13 }}>{n.date}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

export default NotificationList;
