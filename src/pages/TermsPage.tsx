import React from 'react';

const TermsPage: React.FC = () => (
  <div style={{ maxWidth: 800, margin: '40px auto', padding: '32px', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(44,62,80,0.06)' }}>
    <h1 style={{ color: '#1e88e5', fontWeight: 700 }}>Terms & Conditions</h1>
    <p style={{ color: '#333', fontSize: '1.1rem', marginTop: 24 }}>
      Welcome to StartApp Connect. By using our platform, you agree to the following terms and conditions. Please read them carefully before using our services.
    </p>
    <ul style={{ margin: '24px 0', padding: '0 0 0 24px', color: '#333' }}>
      <li>You must be 18 years or older to use this service.</li>
      <li>All information provided must be accurate and complete.</li>
      <li>Investments are subject to risk. StartApp Connect is not liable for any losses.</li>
      <li>Users are responsible for their own interactions.</li>
      <li>We reserve the right to suspend accounts that violate our terms.</li>
    </ul>
    <p style={{ color: '#757575', fontSize: 14, marginTop: 32 }}>For full legal details, contact support@startapp.com.</p>
  </div>
);

export default TermsPage;
