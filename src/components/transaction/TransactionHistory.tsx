import React from 'react';
import styles from '../../styles/components/Form.module.css';

const transactions = [
  {
    id: 1,
    date: '2025-04-25',
    type: 'Investment',
    project: 'Eco-Friendly Delivery Startup',
    amount: 2500,
    status: 'Completed',
  },
  {
    id: 2,
    date: '2025-04-24',
    type: 'Commission',
    project: 'AI-Powered Tutoring App',
    amount: -62.5,
    status: 'Completed',
  },
  {
    id: 3,
    date: '2025-04-23',
    type: 'Investment',
    project: 'AI-Powered Tutoring App',
    amount: 1500,
    status: 'Pending',
  },
];

const formatCurrency = (amount: number) => {
  return (amount < 0 ? '-' : '') + '$' + Math.abs(amount).toLocaleString();
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed': return '#43a047'; // Green
    case 'Pending': return '#e65100'; // Orange
    case 'Failed': return '#d32f2f'; // Red
    default: return '#333';
  }
};

const TransactionHistory: React.FC = () => {
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox} style={{ maxWidth: 700 }}>
        <h1 className={styles.brandTitle}>Transaction History</h1>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
          <thead>
            <tr style={{ background: '#f7f7f7' }}>
              <th style={{ textAlign: 'left', padding: '10px 8px', color: '#757575', fontWeight: 600 }}>Date</th>
              <th style={{ textAlign: 'left', padding: '10px 8px', color: '#757575', fontWeight: 600 }}>Type</th>
              <th style={{ textAlign: 'left', padding: '10px 8px', color: '#757575', fontWeight: 600 }}>Project</th>
              <th style={{ textAlign: 'right', padding: '10px 8px', color: '#757575', fontWeight: 600 }}>Amount</th>
              <th style={{ textAlign: 'center', padding: '10px 8px', color: '#757575', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '10px 8px', color: '#333' }}>{tx.date}</td>
                <td style={{ padding: '10px 8px', color: '#1e88e5', fontWeight: 500 }}>{tx.type}</td>
                <td style={{ padding: '10px 8px', color: '#8e24aa', fontWeight: 500 }}>{tx.project}</td>
                <td style={{ padding: '10px 8px', color: tx.amount < 0 ? '#e65100' : '#43a047', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(tx.amount)}</td>
                <td style={{ padding: '10px 8px', color: getStatusColor(tx.status), textAlign: 'center', fontWeight: 600 }}>{tx.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;
