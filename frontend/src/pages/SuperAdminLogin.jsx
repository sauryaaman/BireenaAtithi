import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { RiHotelLine, RiLockLine, RiMailLine } from 'react-icons/ri';
import '../styles/SuperAdminLogin.css';
const BASE_URL = import.meta.env.VITE_API_URL;

const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {

      const response = await axios.post(
        `${BASE_URL}/api/super-admin/login`,
        formData
      );

      // Store token and user info
      localStorage.setItem('superAdminToken', response.data.token);
      localStorage.setItem('superAdminInfo', JSON.stringify(response.data.user));

      // Redirect to super admin dashboard
      navigate('/super-admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="super-admin-login">
      <div className="login-container">
        <div className="login-header">
          <RiHotelLine className="hotel-icon" />
          <h1>Super Admin Login</h1>
          <p>Hotel Advin Inn Management System</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-icon-wrapper">
              <RiMailLine className="input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-icon-wrapper">
              <RiLockLine className="input-icon" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminLogin;