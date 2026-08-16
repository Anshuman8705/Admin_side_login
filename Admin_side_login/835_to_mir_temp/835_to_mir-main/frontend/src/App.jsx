import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import TOTPSetup from './components/TOTPSetup';
import TOTPVerify from './components/TOTPVerify';
import Home from './components/Home';

// Protected Route component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/totp-setup"
          element={
            <ProtectedRoute>
              <TOTPSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/totp-verify"
          element={
            <ProtectedRoute>
              <TOTPVerify />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
