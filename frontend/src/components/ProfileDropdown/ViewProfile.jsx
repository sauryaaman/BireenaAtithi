import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ViewProfile.css';
const BASE_URL = import.meta.env.VITE_API_URL;

const ViewProfile = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [hotelDetails, setHotelDetails] = useState(null);
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

                // First get user profile
                const userResponse = await axios.get(`${BASE_URL}/api/users/profile`, config);
                setUserDetails(userResponse.data);

                // Then get hotel details
                try {
                    const hotelResponse = await axios.get(`${BASE_URL}/api/users/hotel-details`, config);
                    // console.log('Hotel Details Response:', hotelResponse.data); // Debug log
                    setHotelDetails(hotelResponse.data);
                } catch (hotelError) {
                    console.error('Error fetching hotel details:', hotelError);
                    setError('Could not load hotel details');
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching profile:', error);
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        };

        fetchDetails();
    }, [navigate]);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="profile-view">
            <div className="profile-container">
                {/* Top Logo Section */}
                <div className="logo-section">
                    <div className="hotel-logo-container">
                        {hotelDetails?.hotel_logo_url ? (
                            <img 
                                src={hotelDetails.hotel_logo_url} 
                                alt="Hotel Logo" 
                                className="hotel-logo profile-view-logo"
                                onError={(e) => {
                                    console.log('Error loading image:', e);
                                    e.target.src = 'https://via.placeholder.com/150?text=H';
                                }}
                            />
                        ) : (
                            <div className="default-logo profile-view-logo">
                                {hotelDetails?.hotel_name?.charAt(0) || 'H'}
                            </div>
                        )}
                    </div>
                    <h1>{hotelDetails?.hotel_name || 'Hotel Profile'}</h1>
                </div>

                {/* Main Content Card */}
                <div className="profile-card">
                    <div className="card-header">
                        <h2>Profile Details</h2>
                        <button onClick={() => navigate('/edit-profile')} className="edit-button">
                            Edit Profile
                        </button>
                    </div>

                    {/* User Details Section */}
                    <div className="profile-section">
                        {/* <div className="section-title">
                            <h3>User Information</h3>
                        </div> */}
                        <div className="form-style-info">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Name</label>
                                    <div className="form-value">{userDetails?.name}</div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <div className="form-value">{userDetails?.email}</div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone</label>
                                    <div className="form-value">{userDetails?.owner_phone}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hotel Details Section */}
                    <div className="profile-section">
                        {/* <div className="section-title">
                            <h3>Hotel Information</h3>
                        </div> */}
                        <div className="form-style-info">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Hotel Name</label>
                                    <div className="form-value">{hotelDetails?.hotel_name}</div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Address</label>
                                    <div className="form-value">{hotelDetails?.address_line1}</div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>City</label>
                                    <div className="form-value">{hotelDetails?.city}</div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>State</label>
                                    <div className="form-value">{hotelDetails?.state}</div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Country</label>
                                    <div className="form-value">{hotelDetails?.country}</div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>PIN Code</label>
                                    <div className="form-value">{hotelDetails?.pin_code}</div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>GST Number</label>
                                    <div className="form-value">{hotelDetails?.gst_number}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewProfile;