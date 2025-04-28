import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import VerifyEmail from './pages/VerifyEmail';
import HomePage from './pages/HomePage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './components/auth/LoginPage';
import SignUpPage from './components/auth/SignUpPage';
import PostJobPage from './components/jobPost/PostJobPage';
import ProfilePage from './components/user/ProfilePage';
import SettingsPage from './components/user/SettingsPage';
import InvestmentPage from './components/investment/InvestmentPage';
import JobDetails from './components/jobPost/JobDetails';
import SupportPage from './components/support/SupportPage';
import FeedbackForm from './components/support/FeedbackForm';
import TransactionHistory from './components/transaction/TransactionHistory';
import NotificationList from './components/notifications/NotificationList';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuthContext } from './context/AuthContext';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  const { currentUser } = useAuthContext();
  
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Protected routes */}
        <Route path="/post-project" element={
          <ProtectedRoute>
            <PostJobPage />
          </ProtectedRoute>
        } />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        <Route path="/invest" element={
          <ProtectedRoute>
            <InvestmentPage />
          </ProtectedRoute>
        } />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/transactions" element={
          <ProtectedRoute>
            <TransactionHistory />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationList />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
