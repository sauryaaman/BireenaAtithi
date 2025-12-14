import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ViewProfile.css';
const BASE_URL = import.meta.env.VITE_API_URL;

const StaffViewProfile = () => {
    const [staffDetails, setStaffDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };

                // Get staff profile with hotel details
                const staffResponse = await axios.get(`${BASE_URL}/api/staff/profile-with-hotel`, config);
                setStaffDetails(staffResponse.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching staff profile:', error);
                setError('Could not load profile details');
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
                setLoading(false);
            }
        };

        fetchDetails();
    }, [navigate]);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="profile-view">
            <div className="profile-container">
                {/* Top Logo Section */}
                <div className="logo-section">
                    <div className="hotel-logo-container">
                        {staffDetails?.hotel?.hotel_logo_url ? (
                            <img 
                                src={staffDetails.hotel.hotel_logo_url} 
                                alt="Hotel Logo" 
                                className="hotel-logo profile-view-logo"
                                onError={(e) => {
                                    console.log('Error loading image:', e);
                                    e.target.src = 'https://via.placeholder.com/150?text=H';
                                }}
                            />
                        ) : (
                            <div className="default-logo profile-view-logo">
                                {staffDetails?.hotel?.hotel_name?.charAt(0) || 'H'}
                            </div>
                        )}
                    </div>
                    <h1>{staffDetails?.hotel?.hotel_name || 'Staff Profile'}</h1>
                    <p className="staff-badge">Staff Member</p>
                </div>

                {/* Main Content Card */}
                <div className="profile-card">
                    <div className="card-header">
                        <h2>Profile Details</h2>
                        <span className="view-only-badge">View Only</span>
                    </div>

                    {/* Staff Details Section */}
                    <div className="profile-section">
                        <div className="section-title">
                            <h3>Staff Information</h3>
                        </div>
                        <div className="form-style-info">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Name</label>
                                    <div className="form-value">{staffDetails?.full_name || 'N/A'}</div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone</label>
                                    <div className="form-value">{staffDetails?.phone || 'N/A'}</div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Status</label>
                                    <div className="form-value">
                                        <span className={`status-badge ${staffDetails?.is_active ? 'active' : 'inactive'}`}>
                                            {staffDetails?.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Member Since</label>
                                    <div className="form-value">
                                        {staffDetails?.created_at ? new Date(staffDetails.created_at).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hotel Details Section */}
                    <div className="profile-section">
                        <div className="section-title">
                            <h3>Hotel Information</h3>
                        </div>
                        <div className="form-style-info">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Hotel Name</label>
                                    <div className="form-value">{staffDetails?.hotel?.hotel_name || 'N/A'}</div>
                                </div>
                            </div>
                            {staffDetails?.hotel?.address_line1 && (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Address</label>
                                        <div className="form-value">{staffDetails.hotel.address_line1}</div>
                                    </div>
                                </div>
                            )}
                            {staffDetails?.hotel?.city && (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>City</label>
                                        <div className="form-value">{staffDetails.hotel.city}</div>
                                    </div>
                                </div>
                            )}
                            {staffDetails?.hotel?.state && (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>State</label>
                                        <div className="form-value">{staffDetails.hotel.state}</div>
                                    </div>
                                </div>
                            )}
                            {staffDetails?.hotel?.country && (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Country</label>
                                        <div className="form-value">{staffDetails.hotel.country}</div>
                                    </div>
                                </div>
                            )}
                            {staffDetails?.hotel?.pin_code && (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>PIN Code</label>
                                        <div className="form-value">{staffDetails.hotel.pin_code}</div>
                                    </div>
                                </div>
                            )}
                            {staffDetails?.hotel?.gst_number && (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>GST Number</label>
                                        <div className="form-value">{staffDetails.hotel.gst_number}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Permissions Section */}
                    {staffDetails?.permissions && Object.keys(staffDetails.permissions).length > 0 && (
                        <div className="profile-section">
                            <div className="section-title">
                                <h3>Permissions</h3>
                            </div>
                            <div className="permissions-grid">
                                {Object.entries(staffDetails.permissions).map(([key, value]) => (
                                    value && (
                                        <div key={key} className="permission-badge">
                                            {key}
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffViewProfile;
