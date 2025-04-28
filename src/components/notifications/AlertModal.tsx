import React from 'react';
import styles from '../../styles/components/Form.module.css';

interface AlertModalProps {
  open: boolean;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  onClose: () => void;
}

const getColor = (type?: string) => {
  switch (type) {
    case 'success': return '#43a047'; // Green
    case 'info': return '#1e88e5'; // Blue
    case 'warning': return '#e65100'; // Orange
    case 'error': return '#d32f2f'; // Red
    default: return '#333';
  }
};

const AlertModal: React.FC<AlertModalProps> = ({ open, message, type = 'info', onClose }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 4px 24px rgba(44, 62, 80, 0.18)',
        padding: '32px 28px',
        minWidth: 320,
        maxWidth: '90vw',
        textAlign: 'center',
        borderTop: `6px solid ${getColor(type)}`,
      }}>
        <div style={{ color: getColor(type), fontWeight: 700, fontSize: 20, marginBottom: 12 }}>{type.toUpperCase()}</div>
        <div style={{ color: '#333', fontSize: 16, marginBottom: 24 }}>{message}</div>
        <button
          className={styles.input}
          style={{
            background: getColor(type),
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '10px 32px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 16,
          }}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AlertModal;
