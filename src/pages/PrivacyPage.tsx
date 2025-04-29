import React from 'react';

const PrivacyPage: React.FC = () => (
  <div style={{ maxWidth: 800, margin: '40px auto', padding: '32px', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(44,62,80,0.06)' }}>
    <h1 style={{ color: '#1e88e5', fontWeight: 700 }}>Privacy Policy</h1>
    <p style={{ color: '#333', fontSize: '1.1rem', marginTop: 24 }}>
      Your privacy is important to us. This policy explains how StartApp Connect collects, uses, and protects your information.
    </p>
    <ul style={{ margin: '24px 0', padding: '0 0 0 24px', color: '#333' }}>
      <li>We collect personal information with your consent.</li>
      <li>Your data is encrypted and stored securely.</li>
      <li>We do not sell or share your data with third parties.</li>
    </ul>
    <p>We use cookies and similar technologies to understand user behavior and improve your experience.</p>
    <p>Your data may be shared with trusted third parties to process payments or perform other business functions.</p>
    <p style={{ color: '#757575', fontSize: 14, marginTop: 32 }}>For questions, email privacy@startapp.com.</p>
  </div>
);

export default PrivacyPage;
