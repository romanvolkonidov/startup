import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !token) {
      setStatus('error');
      setMessage('Invalid or missing reset link.');
      return;
    }
    if (newPassword.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }
    setStatus('loading');
    setMessage('');
    const res = await authService.resetPassword(email, token, newPassword);
    if (res.success) {
      setStatus('success');
      setMessage('Password has been reset. You can now log in.');
    } else {
      setStatus('error');
      setMessage(res.message || 'Something went wrong.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '3rem auto', padding: '2rem', textAlign: 'center' }}>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }} disabled={status === 'loading'}>
          {status === 'loading' ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      {message && <div style={{ marginTop: '1rem', color: status === 'error' ? 'red' : 'green' }}>{message}</div>}
      {status === 'success' && (
        <div style={{ marginTop: '1rem' }}>
          <Link to="/login">Go to Login</Link>
        </div>
      )}
    </div>
  );
}
