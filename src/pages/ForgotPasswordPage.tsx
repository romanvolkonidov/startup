import React, { useState } from 'react';
import { authService } from '../services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    const res = await authService.forgotPassword(email);
    if (res.success) {
      setStatus('success');
      setMessage('If this email exists, a reset link has been sent.');
    } else {
      setStatus('error');
      setMessage(res.message || 'Something went wrong.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '3rem auto', padding: '2rem', textAlign: 'center' }}>
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }} disabled={status === 'loading'}>
          {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      {message && <div style={{ marginTop: '1rem', color: status === 'error' ? 'red' : 'green' }}>{message}</div>}
    </div>
  );
}
