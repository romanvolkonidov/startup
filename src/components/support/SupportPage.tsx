import React from 'react';
import styles from '../../styles/components/Form.module.css';

const SupportPage: React.FC = () => {
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox} style={{ maxWidth: 520 }}>
        <h1 className={styles.brandTitle}>Support</h1>
        <p className={styles.subtitle}>Need help? Our team is here to assist you with any questions or issues.</p>
        <ul style={{ color: '#333', fontSize: '1.05rem', margin: '24px 0 0 0', paddingLeft: 20 }}>
          <li>Email: <a href="mailto:support@startapp.com" style={{ color: '#1e88e5', textDecoration: 'none' }}>support@startapp.com</a></li>
          <li>Phone: <span style={{ color: '#43a047' }}>+1 (800) 123-4567</span></li>
          <li>Live chat available 9am-6pm (Mon-Fri)</li>
        </ul>
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <span style={{ color: '#757575', fontSize: 15 }}>Or send us feedback below:</span>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
