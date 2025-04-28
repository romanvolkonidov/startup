import React from 'react';

const PrivacyPage: React.FC = () => (
  <div style={{ maxWidth: 800, margin: '40px auto', padding: '32px', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(44,62,80,0.06)' }}>
    <h1 style={{ color: '#1e88e5', fontWeight: 700 }}>Privacy Policy</h1>
    <p style={{ color: '#333', fontSize: '1.1rem', marginTop: 24 }}>
      Your privacy is important to us. This policy explains how StartUp Connect collects, uses, and protects your information.
    </p>
    <ul style={{ color: '#333', fontSize: '1.05rem', marginTop: 16, paddingLeft: 24 }}>
      <li>We collect only necessary information for account creation and transactions.</li>
      <li>Your data is stored securely and never sold to third parties.</li>
      <li>Cookies are used to enhance your experience on our platform.</li>
      <li>You can request data deletion at any time by contacting support.</li>
    </ul>
    <p style={{ color: '#757575', fontSize: 14, marginTop: 32 }}>For questions, email privacy@startupconnect.com.</p>
  </div>
);

export default PrivacyPage;
