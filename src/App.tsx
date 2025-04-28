import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VerifyEmail from './pages/VerifyEmail';

function App() {
  return (
    <Router>
      <Routes>
        {/* ...other routes... */}
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
    </Router>
  );
}

export default App;
