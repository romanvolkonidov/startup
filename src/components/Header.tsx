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
              <Link to="/invest" className={styles.navLink} aria-current={location.pathname === '/invest' ? 'page' : undefined}>Invest</Link>
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
