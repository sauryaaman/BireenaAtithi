import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  RiHotelLine, RiAddLine, RiEditLine, RiDeleteBinLine, 
  RiSearchLine, RiLogoutBoxRLine 
} from 'react-icons/ri';
import '../styles/SuperAdminDashboard.css';
const BASE_URL = import.meta.env.VITE_API_URL;

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    hotelName: '',
    phone: ''
  });

  // Get token from localStorage
  const token = localStorage.getItem('superAdminToken');

  // Fetch users on component mount
  useEffect(() => {
    if (!token) {
      navigate('/super-admin/login');
      return;
    }
    fetchUsers();
  }, [token, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${BASE_URL}/api/users/register`,
        {
          name: formData.username,
          email: formData.email,
          password: formData.password,
          hotel_name: formData.hotelName || 'Not specified',
          owner_phone: formData.phone || 'Not specified'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Reset form and refresh user list
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        hotelName: '',
        phone: ''
      });
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await axios.delete(`${BASE_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdminInfo');
    navigate('/super-admin/login');
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    (user.hotel_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="super-admin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-title">
          <RiHotelLine className="header-icon" />
          <h1>Super Admin Dashboard</h1>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <RiLogoutBoxRLine /> Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="content-header">
          <div className="search-bar">
            <RiSearchLine />
            <input
              type="text"
              placeholder="Search hotels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={() => setShowModal(true)} className="add-btn">
            <RiAddLine /> Add New Hotel
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Users Table */}
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Hotel Name</th>
                <th>Email</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.user_id}>
                  <td>{user.hotel_name || user.name}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="action-buttons">
                    <button className="edit-btn">
                      <RiEditLine /> Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteUser(user.user_id)}
                    >
                      <RiDeleteBinLine /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add Hotel Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Add New Hotel</h2>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Hotel Name</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    username: e.target.value
                  }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    password: e.target.value
                  }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Hotel Name</label>
                <input
                  type="text"
                  value={formData.hotelName}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    hotelName: e.target.value
                  }))}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    phone: e.target.value
                  }))}
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Hotel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;