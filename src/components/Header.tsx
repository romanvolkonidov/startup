import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../styles/components/Header.module.css';
import { useAuthContext } from '../context/AuthContext';

const Header: React.FC = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuthContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Link to="/" className={styles.logo}>
          StartApp
        </Link>
        
        {/* Mobile menu toggle button */}
        <button 
          className={styles.hamburgerMenu} 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className={`${styles.hamburgerBar} ${mobileMenuOpen ? styles.active : ''}`}></div>
          <div className={`${styles.hamburgerBar} ${mobileMenuOpen ? styles.active : ''}`}></div>
          <div className={`${styles.hamburgerBar} ${mobileMenuOpen ? styles.active : ''}`}></div>
        </button>
        
        <nav className={`${styles.nav} ${mobileMenuOpen ? styles.active : ''}`}>
          <Link to="/" className={styles.navLink} aria-current={location.pathname === '/' ? 'page' : undefined}>Home</Link>
          {currentUser ? (
            <>
              <Link to="/dashboard" className={styles.navLink} aria-current={location.pathname === '/dashboard' ? 'page' : undefined}>Browse Projects</Link>
              <Link to="/post-project" className={styles.navLink} aria-current={location.pathname === '/post-project' ? 'page' : undefined}>Post Project</Link>
              <Link to="/my-posts" className={styles.navLink} aria-current={location.pathname === '/my-posts' ? 'page' : undefined}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <line x1="10" y1="9" x2="8" y2="9"/>
                  </svg>
                  My Posts
                </span>
              </Link>
              <Link to="/saved-posts" className={styles.navLink} aria-current={location.pathname === '/saved-posts' ? 'page' : undefined}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={location.pathname === '/saved-posts' ? '#e53935' : 'none'} stroke={location.pathname === '/saved-posts' ? '#e53935' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21C12 21 4 13.36 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.36 16 21 16 21H12Z" />
                  </svg>
                  Saved
                </span>
              </Link>
              <Link to="/profile" className={styles.navLink} aria-current={location.pathname === '/profile' ? 'page' : undefined}>Profile</Link>
              <Link to="/notifications" className={styles.navLink} aria-current={location.pathname === '/notifications' ? 'page' : undefined}>Notifications</Link>
            </>
          ) : null}
        </nav>
        {currentUser ? (
          <button className={`${styles.ctaButton} ${mobileMenuOpen ? styles.active : ''}`} onClick={logout}>
            Logout
          </button>
        ) : (
          <Link to="/login" className={`${styles.ctaButton} ${mobileMenuOpen ? styles.active : ''}`}>
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
