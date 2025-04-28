import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'https://startup-bp55.onrender.com/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided. Please check your email link.');
      return;
    }

    // Decode the token if it's URL-encoded
    const decodedToken = decodeURIComponent(token);
    
    fetch(`${API_URL}/auth/verify-email?token=${decodedToken}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
        } else {
          setStatus('error');
          if (data.expired) {
            setExpired(true);
          }
        }
        setMessage(data.message || 'Email verification complete.');
      })
      .catch((error) => {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Verification failed. Please try again or contact support.');
      });
  }, [searchParams]);

  return (
    <div className="verify-email-container" style={{ 
      padding: '2rem', 
      maxWidth: '500px', 
      margin: '0 auto',
      textAlign: 'center',
      marginTop: '3rem'
    }}>
      <h1>Email Verification</h1>
      
      {status === 'loading' && (
        <div className="loading">
          <p>{message}</p>
          <div className="spinner" style={{ margin: '1rem auto' }}></div>
        </div>
      )}
      
      {status === 'success' && (
        <div className="success" style={{ color: 'green' }}>
          <p>{message}</p>
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
        </div>
      )}
      
      {status === 'error' && (
        <div className="error" style={{ color: 'red' }}>
          <p>{message}</p>
          {expired && (
            <div style={{ margin: '1rem 0' }}>
              <Link to="/signup" style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#f44336', 
                color: 'white', 
                textDecoration: 'none',
                borderRadius: '4px'
              }}>
                Request New Verification Email
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}