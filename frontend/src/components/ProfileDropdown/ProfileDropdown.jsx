import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEdit, FaKey, FaSignOutAlt, FaCamera } from 'react-icons/fa';
import './ProfileDropdown.css';
const BASE_URL = import.meta.env.VITE_API_URL;

const ProfileDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [hotelDetails, setHotelDetails] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [error, setError] = useState(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Fetch user and hotel details
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

                // Fetch user profile and hotel details in parallel
                const [userResponse, hotelResponse] = await Promise.all([
                    axios.get(`${BASE_URL}/api/users/profile`, config),
                    axios.get(`${BASE_URL}/api/users/hotel-details`, config)
                ]);

                setUserDetails(userResponse.data);
                setHotelDetails(hotelResponse.data);
                setError(null);
            } catch (error) {
                console.error('Error fetching details:', error);
                setError('Failed to load profile');
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        };

        fetchDetails();
    }, [navigate]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleViewProfile = () => {
        // Check if user is staff by checking if they have staff_id
        const isStaff = localStorage.getItem('isStaff') === 'true';
        if (isStaff) {
            navigate('/staff-profile');
        } else {
            navigate('/view-profile', { 
                state: { userDetails, hotelDetails } 
            });
        }
        setIsOpen(false);
    };

    const handleEditProfile = () => {
        navigate('/edit-profile', { 
            state: { userDetails, hotelDetails } 
        });
        setIsOpen(false);
    };

    const isStaff = localStorage.getItem('isStaff') === 'true';

    return (
        <div className="profile-dropdown" ref={dropdownRef}>
            <div className="profile-icon" onClick={() => setIsOpen(!isOpen)}>
                {!isStaff && hotelDetails?.hotel_logo_url ? (
                    <img 
                        src={hotelDetails.hotel_logo_url} 
                        alt="Hotel Logo" 
                        className="hotel-logo"
                    />
                ) : (
                    <div className="default-logo">
                        {isStaff ? (userDetails?.name?.charAt(0) || 'S') : (userDetails?.hotel_name?.charAt(0) || 'H')}
                    </div>
                )}
            </div>

            {isOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-header">
                        <div className="profile-info">
                            <div className="profile-image-container">
                                {!isStaff && hotelDetails?.hotel_logo_url ? (
                                    <img 
                                        src={hotelDetails.hotel_logo_url} 
                                        alt="Hotel Logo"
                                        className="profile-image"
                                    />
                                ) : (
                                    <div className="profile-image-placeholder">
                                        <FaUser />
                                    </div>
                                )}
                            </div>
                            <div className="profile-text">
                                <span className="user-name">{userDetails?.name}</span>
                                {!isStaff && <span className="hotel-name">{userDetails?.hotel_name}</span>}
                                {isStaff && <span className="staff-role">Staff Member</span>}
                            </div>
                        </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleViewProfile} className="dropdown-item">
                        <FaUser className="dropdown-icon" />
                        <span>View Profile</span>
                    </button>
                    {!isStaff && (
                        <button onClick={handleEditProfile} className="dropdown-item">
                            <FaEdit className="dropdown-icon" />
                            <span>Edit Profile</span>
                        </button>
                    )}
                    <button onClick={() => { navigate('/change-password'); setIsOpen(false); }} className="dropdown-item">
                        <FaKey className="dropdown-icon" />
                        <span>Change Password</span>
                    </button>
                    <div className="dropdown-divider"></div>
                    <button 
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('userInfo');
                            localStorage.removeItem('isStaff');
                            navigate('/login');
                        }} 
                        className="dropdown-item logout-item"
                    >
                        <FaSignOutAlt className="dropdown-icon" />
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;