import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  RiUserLine,
  RiSettingsLine,
  RiLogoutBoxLine,
  RiLockPasswordLine,
} from 'react-icons/ri';
import './ProfileDropdown.css';
const BASE_URL = import.meta.env.VITE_API_URL;

const ProfileDropdown = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleViewProfile = () => {
    navigate('/profile');
    setShowDropdown(false);
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
    setShowDropdown(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      const token = localStorage.getItem('token');
      await axios.put(
        `${BASE_URL}/api/users/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowChangePasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setError('');
      alert('Password changed successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="profile-dropdown-container">
      <div 
        className="profile-button" 
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <RiUserLine className="profile-icon" />
      </div>

      {showDropdown && (
        <div className="dropdown-menu">
          <div className="dropdown-item" onClick={handleViewProfile}>
            <RiUserLine /> View Profile
          </div>
          <div className="dropdown-item" onClick={handleEditProfile}>
            <RiSettingsLine /> Edit Profile
          </div>
          <div 
            className="dropdown-item" 
            onClick={() => {
              setShowChangePasswordModal(true);
              setShowDropdown(false);
            }}
          >
            <RiLockPasswordLine /> Change Password
          </div>
          <div className="dropdown-item" onClick={handleLogout}>
            <RiLogoutBoxLine /> Logout
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Change Password</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                    setError('');
                  }}
                >
                  Cancel
                </button>
                <button type="submit">Change Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
