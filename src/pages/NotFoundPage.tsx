import React from 'react';

const NotFoundPage: React.FC = () => (
  <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
    <h1 style={{ color: '#e65100', fontSize: '3rem', fontWeight: 700, marginBottom: 16 }}>404</h1>
    <h2 style={{ color: '#1e88e5', fontWeight: 600, marginBottom: 8 }}>Page Not Found</h2>
    <p style={{ color: '#333', fontSize: '1.1rem', marginBottom: 24 }}>Sorry, the page you are looking for does not exist or has been moved.</p>
    <a href="/" style={{ color: '#fff', background: 'linear-gradient(90deg, #1e88e5 60%, #43a047 100%)', padding: '12px 32px', borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: '1.1rem' }}>Go to Home</a>
  </div>
);

export default NotFoundPage;
