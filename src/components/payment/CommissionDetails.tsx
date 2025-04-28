import React from 'react';
import styles from '../../styles/components/Form.module.css';

const CommissionDetails: React.FC = () => {
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox} style={{ maxWidth: 520 }}>
        <h1 className={styles.brandTitle}>Commission Details</h1>
        <p className={styles.subtitle}>Learn about platform fees and commission structure for investments and payments.</p>
        <ul style={{ color: '#333', fontSize: '1.05rem', margin: '24px 0 0 0', paddingLeft: 20 }}>
          <li>Platform fee: <span style={{ color: '#e65100', fontWeight: 600 }}>2.5%</span> per transaction</li>
          <li>No hidden charges or monthly fees</li>
          <li>Commission is automatically deducted from each payment</li>
          <li>For large investments, contact support for custom rates</li>
        </ul>
      </div>
    </div>
  );
};

export default CommissionDetails;
