import React from 'react';
import JobPostList from './JobPostList';
import buttonStyles from '../../styles/components/Button.module.css';
import styles from '../../styles/components/Form.module.css';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  return (
    <div style={{ background: '#fff', minHeight: '100vh', padding: '0 0 40px 0' }}>
      <header style={{
        background: 'linear-gradient(90deg, #1976d2 60%, #43a047 100%)',
        color: '#fff',
        padding: '40px 0 24px 0',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>Welcome to StartUp Connect</h1>
        <p style={{ fontSize: '1.2rem', margin: '16px 0 0 0', color: '#e3f2fd' }}>
          Post your startup or project, attract investors, and grow your vision.
        </p>
        <Link to="/post-job">
          <button
            className={buttonStyles.primaryButton}
            style={{
              background: 'linear-gradient(90deg, #ff9800 60%, #8e24aa 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '1.1rem',
              marginTop: 24,
              boxShadow: '0 4px 16px rgba(255, 152, 0, 0.12)',
              border: 'none',
              borderRadius: 8,
              padding: '12px 32px',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            Post a Project
          </button>
        </Link>
      </header>
      <main style={{
        maxWidth: 900,
        margin: '40px auto 0 auto',
        background: '#f7f9fa',
        borderRadius: 16,
        boxShadow: '0 2px 12px rgba(44, 62, 80, 0.06)',
        padding: '32px 24px',
        minHeight: 400,
      }}>
        <h2 style={{ color: '#222', fontWeight: 600, marginBottom: 24 }}>Latest Projects</h2>
        <JobPostList />
      </main>
    </div>
  );
};

export default Dashboard;
