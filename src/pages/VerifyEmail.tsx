import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Verifying...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      fetch(`${API_URL}/auth/verify-email?token=${token}`)
        .then(res => res.json())
        .then(data => setMessage(data.message))
        .catch(() => setMessage('Verification failed.'));
    } else {
      setMessage('No token provided.');
    }
  }, [searchParams]);

  return <div>{message}</div>;
}