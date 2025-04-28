import React from 'react';
import styles from '../../styles/components/Form.module.css';
import buttonStyles from '../../styles/components/Button.module.css';

const InvestmentPage: React.FC = () => {
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox} style={{ maxWidth: 520 }}>
        <h1 className={styles.brandTitle}>Invest in a Project</h1>
        <p className={styles.subtitle}>Support innovative startups and projects. Choose an amount and help them grow!</p>
        <form className={styles.form}>
          <label className={styles.label} htmlFor="amount">Investment Amount</label>
          <input
            className={styles.input}
            id="amount"
            type="number"
            min="1"
            placeholder="$1000"
            required
          />
          <label className={styles.label} htmlFor="message">Message (optional)</label>
          <textarea
            className={styles.input}
            id="message"
            rows={3}
            placeholder="Add a message for the project owner..."
            style={{ resize: 'vertical' }}
          />
          <button
            className={buttonStyles.primaryButton}
            type="submit"
            style={{ marginTop: 8 }}
          >
            Invest Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default InvestmentPage;
