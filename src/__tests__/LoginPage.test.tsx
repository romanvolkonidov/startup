import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../components/auth/LoginPage';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';

// Mock Firebase auth
jest.mock('../firebase', () => ({
  auth: {},
  googleProvider: {},
  appleProvider: {},
  default: {}
}));

// Mock authService
jest.mock('../services/authService', () => ({
  authService: {
    loginWithFirebase: jest.fn().mockResolvedValue({ success: false, message: 'Invalid credentials' }),
    signupWithFirebase: jest.fn().mockResolvedValue({ success: false, message: 'Registration failed' }),
    sendFirebasePasswordReset: jest.fn().mockResolvedValue({ success: true }),
    signInWithGoogle: jest.fn().mockResolvedValue({ success: false, message: 'Google login failed' }),
    signInWithApple: jest.fn().mockResolvedValue({ success: false, message: 'Apple login failed' })
  }
}));

// Mock React Router hooks
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useNavigate: () => jest.fn(),
  };
});

describe('LoginPage', () => {
  it('renders login form with correct elements', () => {
    render(
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <LoginPage />
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    );

    // Verify core elements are present
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    
    // Check social login buttons
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apple/i })).toBeInTheDocument();
    
    // Check sign up link
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });
});
