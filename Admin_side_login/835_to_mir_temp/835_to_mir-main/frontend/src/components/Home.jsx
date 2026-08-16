import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await authAPI.getUserProfile();
      setUser(response.data);
      setLoading(false);
    } catch (err) {
      // If unauthorized, redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div>
        <div className="navbar">
          <div className="navbar-brand">PROJECT835</div>
        </div>
        <div className="container">
          <div className="card">
            <div className="loading">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="navbar">
        <div className="navbar-brand">PROJECT835</div>
        <div className="navbar-links">
          <a href="/home">Home</a>
          <a onClick={handleLogout} style={{ cursor: 'pointer' }}>
            Logout
          </a>
        </div>
      </div>

      <div className="container">
        <div className="home-card">
          <h1>Welcome, {user?.name}!</h1>
          <p>You have successfully authenticated.</p>

          <hr />

          <div className="user-info">
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>Mobile:</strong> {user?.mobile}
            </p>
            <p>
              <strong>Two-Factor Authentication:</strong>{' '}
              {user?.totp_enabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
