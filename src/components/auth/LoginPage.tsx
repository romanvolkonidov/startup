import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuthContext } from '../../context/AuthContext';
import styles from '../../styles/components/auth/LoginPage.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const { setToken, setCurrentUser } = useAuthContext();
  const navigate = useNavigate();

  // Handle form mode changes
  const switchMode = (mode: 'login' | 'register' | 'reset') => {
    setError('');
    setInfo('');
    setIsRegister(mode === 'register');
    setIsResetMode(mode === 'reset');
  };

  // Unified handler for login and registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    setInfo('');
    
    try {
      let res;
      if (isResetMode) {
        res = await authService.sendFirebasePasswordReset(email);
        if (res.success) {
          setInfo('Password reset email sent. Please check your inbox.');
          setStatus('success');
        } else {
          setError(res.message || 'Failed to send reset email');
        }
      } else if (isRegister) {
        res = await authService.signupWithFirebase(email, password, name);
        if (res.success) {
          setToken(res.token);
          setCurrentUser(res.user);
          navigate('/dashboard');
        } else {
          setError(res.message || 'Registration failed');
        }
      } else {
        res = await authService.loginWithFirebase(email, password);
        if (res.success) {
          setToken(res.token);
          setCurrentUser(res.user);
          navigate('/dashboard');
        } else {
          setError(res.message || 'Login failed');
        }
      }
    } catch (error) {
      setStatus('error');
      setError('An error occurred. Please try again.');
    } finally {
      setStatus('idle');
    }
  };

  // Social login handlers
  const handleSocial = async (provider: 'google' | 'apple') => {
    setStatus('loading');
    setError('');
    setInfo('');
    try {
      let res;
      if (provider === 'google') {
        res = await authService.signInWithGoogle();
      } else if (provider === 'apple') {
        res = await authService.signInWithApple();
      }
      
      // Check if res exists and has success property before using it
      if (res && res.success) {
        setToken(res.token);
        setCurrentUser(res.user);
        navigate('/dashboard');
      } else {
        setStatus('error');
        setError((res?.message) || 'Sign-in failed');
      }
    } catch (error) {
      setStatus('error');
      setError('An error occurred with sign-in');
    } finally {
      setStatus('idle');
    }
  };

  // Get the appropriate form title based on current mode
  const getFormTitle = () => {
    if (isResetMode) return 'Reset Password';
    return isRegister ? 'Sign Up' : 'Login';
  };

  // Get the appropriate button text based on current mode and loading state
  const getButtonText = () => {
    if (status === 'loading') {
      if (isResetMode) return 'Sending...';
      return isRegister ? 'Signing up...' : 'Logging in...';
    }
    if (isResetMode) return 'Send Reset Link';
    return isRegister ? 'Sign Up' : 'Login';
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h2>{getFormTitle()}</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Name field - only for registration */}
          {isRegister && (
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                disabled={status === 'loading'}
                placeholder="Enter your full name"
                className={styles.input}
              />
            </div>
          )}
          
          {/* Email field - for all modes */}
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={status === 'loading'}
              placeholder="your.email@example.com"
              className={styles.input}
            />
          </div>
          
          {/* Password field - not for reset mode */}
          {!isResetMode && (
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={status === 'loading'}
                placeholder="Your password"
                className={styles.input}
                minLength={6}
              />
            </div>
          )}
          
          {/* Forgot password link - only for login mode */}
          {!isRegister && !isResetMode && (
            <div className={styles.forgotPassword}>
              <button 
                type="button" 
                className={styles.linkButton} 
                onClick={() => switchMode('reset')}
              >
                Forgot password?
              </button>
            </div>
          )}
          
          {/* Display error and info messages */}
          {error && <div className={styles.error}>{error}</div>}
          {info && <div className={styles.info}>{info}</div>}
          
          {/* Submit button */}
          <button
            type="submit"
            className={styles.loginButton}
            disabled={status === 'loading'}
          >
            {getButtonText()}
          </button>
        </form>
        
        {/* Social login section - not for reset mode */}
        {!isResetMode && (
          <div className={styles.socialLoginContainer}>
            <h4>Or {isRegister ? 'sign up' : 'sign in'} with</h4>
            <div className={styles.socialButtons}>
              <button
                type="button"
                onClick={() => handleSocial('google')}
                disabled={status === 'loading'}
                className={`${styles.socialButton} ${styles.googleButton}`}
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocial('apple')}
                disabled={status === 'loading'}
                className={`${styles.socialButton} ${styles.appleButton}`}
              >
                Apple
              </button>
            </div>
          </div>
        )}
        
        {/* Navigation between forms */}
        <div className={styles.noAccount}>
          {isResetMode ? (
            <button className={styles.linkButton} onClick={() => switchMode('login')}>
              Back to login
            </button>
          ) : isRegister ? (
            <>
              Already have an account?{' '}
              <button className={styles.linkButton} onClick={() => switchMode('login')}>
                Login
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{' '}
              <button className={styles.linkButton} onClick={() => switchMode('register')}>
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
