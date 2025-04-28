import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'https://startup-bp55.onrender.com/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [manualEmail, setManualEmail] = useState('');
  const [manualEmailError, setManualEmailError] = useState('');

  useEffect(() => {
    // Try to get email from query or localStorage
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem('verifyEmail', emailParam);
    } else {
      const stored = localStorage.getItem('verifyEmail');
      if (stored) setEmail(stored);
    }
  }, [searchParams]);

  // Request code on mount if email is present
  useEffect(() => {
    if (email && !codeSent) {
      setStatus('loading');
      fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'placeholder', name: 'placeholder' })
      })
        .then(res => res.json())
        .then(data => {
          setStatus('idle');
          setMessage(data.message);
          setCodeSent(true);
        })
        .catch(() => {
          setStatus('error');
          setMessage('Failed to send verification code.');
        });
    }
  }, [email, codeSent]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('Verifying code...');
    try {
      const res = await fetch(`${API_URL}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setMessage('Email verified! You can now log in.');
        localStorage.removeItem('verifyEmail');
      } else {
        setStatus('error');
        setMessage(data.message || 'Invalid code.');
      }
    } catch {
      setStatus('error');
      setMessage('Verification failed.');
    }
  };

  const handleResend = async () => {
    setResendStatus('loading');
    setMessage('Resending code...');
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'placeholder', name: 'placeholder' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendStatus('sent');
        setMessage('Verification code resent. Please check your email.');
      } else {
        setResendStatus('error');
        setMessage(data.message || 'Failed to resend code.');
      }
    } catch {
      setResendStatus('error');
      setMessage('Failed to resend code.');
    }
  };

  // If no email, allow manual entry
  if (!email) {
    return (
      <div className="verify-email-container" style={{ 
        padding: '2rem', 
        maxWidth: '500px', 
        margin: '0 auto',
        textAlign: 'center',
        marginTop: '3rem'
      }}>
        <h1>Email Verification</h1>
        <form onSubmit={e => {
          e.preventDefault();
          if (!manualEmail.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
            setManualEmailError('Please enter a valid email address.');
            return;
          }
          setManualEmailError('');
          setEmail(manualEmail);
          localStorage.setItem('verifyEmail', manualEmail);
        }} style={{ margin: '2rem 0' }}>
          <input
            type="email"
            value={manualEmail}
            onChange={e => setManualEmail(e.target.value)}
            placeholder="Enter your email"
            style={{ fontSize: '1.1rem', padding: '0.5rem', width: '100%' }}
            required
          />
          {manualEmailError && <div style={{ color: 'red', margin: '0.5rem 0' }}>{manualEmailError}</div>}
          <div style={{ margin: '1rem 0' }}>
            <button type="submit" style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}>
              Continue
            </button>
          </div>
        </form>
        <div>
          <Link to="/signup">Go to Signup</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-email-container" style={{ 
      padding: '2rem', 
      maxWidth: '500px', 
      margin: '0 auto',
      textAlign: 'center',
      marginTop: '3rem'
    }}>
      <h1>Email Verification</h1>
      {email ? (
        <>
          <p>{message}</p>
          {status !== 'success' && (
            <form onSubmit={handleVerify} style={{ margin: '2rem 0' }}>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                maxLength={6}
                style={{ fontSize: '1.2rem', padding: '0.5rem', letterSpacing: '0.3em', textAlign: 'center' }}
                required
              />
              <div style={{ margin: '1rem 0' }}>
                <button type="submit" disabled={status === 'loading'} style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}>
                  Verify
                </button>
              </div>
            </form>
          )}
          {status === 'success' && (
            <div style={{ margin: '1rem 0' }}>
              <Link to="/login" style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#4CAF50',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px'
              }}>
                Go to Login
              </Link>
            </div>
          )}
          <div style={{ margin: '1rem 0' }}>
            <button onClick={handleResend} disabled={resendStatus === 'loading'} style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              {resendStatus === 'loading' ? 'Resending...' : 'Resend Code'}
            </button>
          </div>
        </>
      ) : (
        <div>
          <p>No email found. Please sign up again.</p>
          <Link to="/signup">Go to Signup</Link>
        </div>
      )}
      {status === 'error' && <div style={{ color: 'red' }}>{message}</div>}
    </div>
  );
}