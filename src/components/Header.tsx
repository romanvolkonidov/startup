import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../../styles/components/Header.module.css';

const Header: React.FC = () => {
  const location = useLocation();
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Link to="/" className={styles.logo}>
          StartUp
        </Link>
        <nav className={styles.nav}>
          <Link to="/dashboard" className={styles.navLink} aria-current={location.pathname === '/dashboard' ? 'page' : undefined}>Dashboard</Link>
          <Link to="/post-job" className={styles.navLink} aria-current={location.pathname === '/post-job' ? 'page' : undefined}>Post Job</Link>
          <Link to="/invest" className={styles.navLink} aria-current={location.pathname === '/invest' ? 'page' : undefined}>Invest</Link>
          <Link to="/profile" className={styles.navLink} aria-current={location.pathname === '/profile' ? 'page' : undefined}>Profile</Link>
        </nav>
        <Link to="/login" className={styles.ctaButton}>
          Login
        </Link>
      </div>
    </header>
  );
};

export default Header;
