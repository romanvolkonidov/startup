import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../styles/components/Header.module.css';
import { useAuthContext } from '../context/AuthContext';

const Header: React.FC = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuthContext();
  
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Link to="/" className={styles.logo}>
          StartUp
        </Link>
        <nav className={styles.nav}>
          <Link to="/" className={styles.navLink} aria-current={location.pathname === '/' ? 'page' : undefined}>Home</Link>
          {currentUser ? (
            <>
              <Link to="/post-project" className={styles.navLink} aria-current={location.pathname === '/post-project' ? 'page' : undefined}>Post Project</Link>
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
          <button className={styles.ctaButton} onClick={logout}>
            Logout
          </button>
        ) : (
          <Link to="/login" className={styles.ctaButton}>
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
