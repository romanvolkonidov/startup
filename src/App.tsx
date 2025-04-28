import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VerifyEmail from './pages/VerifyEmail';
import HomePage from './pages/HomePage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFoundPage from './pages/NotFoundPage';
// Import your auth and dashboard pages as needed
import LoginPage from './components/auth/LoginPage';
import SignUpPage from './components/auth/SignUpPage';
// Example: import Dashboard from './components/dashboard/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        {/* Add more routes as needed, e.g. dashboard, post-job, etc. */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
