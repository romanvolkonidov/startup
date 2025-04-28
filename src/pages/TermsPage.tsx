import React from 'react';

const TermsPage: React.FC = () => (
  <div style={{ maxWidth: 800, margin: '40px auto', padding: '32px', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(44,62,80,0.06)' }}>
    <h1 style={{ color: '#1e88e5', fontWeight: 700 }}>Terms & Conditions</h1>
    <p style={{ color: '#333', fontSize: '1.1rem', marginTop: 24 }}>
      Welcome to StartUp Connect. By using our platform, you agree to the following terms and conditions. Please read them carefully before using our services.
    </p>
    <ul style={{ color: '#333', fontSize: '1.05rem', marginTop: 16, paddingLeft: 24 }}>
      <li>All users must provide accurate information during registration.</li>
      <li>Investments are subject to risk. StartUp Connect is not liable for any losses.</li>
      <li>Users must comply with all applicable laws and regulations.</li>
      <li>Platform fees and commissions apply to all transactions.</li>
      <li>Abusive or fraudulent activity will result in account suspension.</li>
    </ul>
    <p style={{ color: '#757575', fontSize: 14, marginTop: 32 }}>For full legal details, contact support@startupconnect.com.</p>
  </div>
);

export default TermsPage;
