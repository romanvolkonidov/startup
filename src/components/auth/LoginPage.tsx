import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuthContext } from '../../context/AuthContext';
import styles from '../../styles/components/auth/LoginPage.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');
  const { setToken, setCurrentUser } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const res = await authService.login(email, password);
      if (res.success) {
        localStorage.setItem('token', res.token);
        setToken(res.token);
        setCurrentUser(res.user);
        navigate('/dashboard');
      } else {
        setStatus('error');
        setError(res.message || 'Invalid credentials');
      }
    } catch (error) {
      setStatus('error');
      setError('An error occurred. Please try again.');
    } finally {
      setStatus('idle');
    }
  };

  // Social login handlers
  const handleGoogleLogin = async () => {
    setStatus('loading');
    setError('');
    try {
      const res = await authService.signInWithGoogle();
      if (res.success) {
        setToken(res.token);
        setCurrentUser(res.user);
        navigate('/dashboard');
      } else {
        setStatus('error');
        setError(res.message || 'Google sign-in failed');
      }
    } catch (error) {
      setStatus('error');
      setError('An error occurred with Google sign-in');
    } finally {
      setStatus('idle');
    }
  };

  const handleFacebookLogin = async () => {
    setStatus('loading');
    setError('');
    try {
      const res = await authService.signInWithFacebook();
      if (res.success) {
        setToken(res.token);
        setCurrentUser(res.user);
        navigate('/dashboard');
      } else {
        setStatus('error');
        setError(res.message || 'Facebook sign-in failed');
      }
    } catch (error) {
      setStatus('error');
      setError('An error occurred with Facebook sign-in');
    } finally {
      setStatus('idle');
    }
  };

  const handleTwitterLogin = async () => {
    setStatus('loading');
    setError('');
    try {
      const res = await authService.signInWithTwitter();
      if (res.success) {
        setToken(res.token);
        setCurrentUser(res.user);
        navigate('/dashboard');
      } else {
        setStatus('error');
        setError(res.message || 'Twitter sign-in failed');
      }
    } catch (error) {
      setStatus('error');
      setError('An error occurred with Twitter sign-in');
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === 'loading'}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={status === 'loading'}
            />
          </div>
          <div className={styles.forgotPassword}>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className={styles.socialLoginContainer}>
          <h4>Or sign in with</h4>
          <div className={styles.socialButtons}>
            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={status === 'loading'}
              className={`${styles.socialButton} ${styles.googleButton}`}
            >
              Google
            </button>
            <button 
              type="button"
              onClick={handleFacebookLogin}
              disabled={status === 'loading'}
              className={`${styles.socialButton} ${styles.facebookButton}`}
            >
              Facebook
            </button>
            <button 
              type="button"
              onClick={handleTwitterLogin}
              disabled={status === 'loading'}
              className={`${styles.socialButton} ${styles.twitterButton}`}
            >
              Twitter
            </button>
          </div>
        </div>
        
        <div className={styles.noAccount}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
