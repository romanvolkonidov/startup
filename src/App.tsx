import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/globalStyles.css';
import './styles/theme.css';
import Header from './components/Header';

const HomePage = lazy(() => import('./pages/HomePage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const LoginPage = lazy(() => import('./components/auth/LoginPage'));
const SignUpPage = lazy(() => import('./components/auth/SignUpPage'));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const PostJobPage = lazy(() => import('./components/jobPost/PostJobPage'));
const JobDetails = lazy(() => import('./components/jobPost/JobDetails'));
const InvestmentPage = lazy(() => import('./components/investment/InvestmentPage'));
const AgreementForm = lazy(() => import('./components/investment/AgreementForm'));
const ProfilePage = lazy(() => import('./components/user/ProfilePage'));
const SettingsPage = lazy(() => import('./components/user/SettingsPage'));
const PaymentPage = lazy(() => import('./components/payment/PaymentPage'));
const CommissionDetails = lazy(() => import('./components/payment/CommissionDetails'));
const NotificationList = lazy(() => import('./components/notifications/NotificationList'));
const SupportPage = lazy(() => import('./components/support/SupportPage'));
const FeedbackForm = lazy(() => import('./components/support/FeedbackForm'));
const TransactionHistory = lazy(() => import('./components/transaction/TransactionHistory'));
const ProtectedRoute = lazy(() => import('./components/auth/ProtectedRoute'));

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/post-job" element={<ProtectedRoute><PostJobPage /></ProtectedRoute>} />
          <Route path="/job/:id" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
          <Route path="/invest" element={<ProtectedRoute><InvestmentPage /></ProtectedRoute>} />
          <Route path="/agreement" element={<ProtectedRoute><AgreementForm /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="/commission" element={<ProtectedRoute><CommissionDetails /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationList /></ProtectedRoute>} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/feedback" element={<FeedbackForm />} />
          <Route path="/transactions" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
