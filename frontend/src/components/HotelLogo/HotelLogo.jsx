import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEdit, FaKey, FaSignOutAlt } from 'react-icons/fa';
import './HotelLogo.css';

const BASE_URL = import.meta.env.VITE_API_URL;

const HotelLogo = ({ className = '', showDropdown = false }) => {
    const navigate = useNavigate();
    const [hotelDetails, setHotelDetails] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchHotelDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };

                const isStaff = localStorage.getItem('isStaff') === 'true';

                if (isStaff) {
                    // Fetch staff profile with hotel
                    const staffResponse = await axios.get(`${BASE_URL}/api/staff/profile-with-hotel`, config);
                    setUserDetails({ name: staffResponse.data.full_name });
                    setHotelDetails({
                        hotel_logo_url: staffResponse.data.hotel?.hotel_logo_url,
                        hotel_name: staffResponse.data.hotel?.hotel_name
                    });
                } else {
                    // Fetch user and hotel details
                    const [userResponse, hotelResponse] = await Promise.all([
                        axios.get(`${BASE_URL}/api/users/profile`, config),
                        axios.get(`${BASE_URL}/api/users/hotel-details`, config)
                    ]);
                    setUserDetails(userResponse.data);
                    setHotelDetails(hotelResponse.data);
                }
                setError(null);
            } catch (error) {
                console.error('Error fetching hotel details:', error);
                setError('Failed to load hotel details');
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        };

        fetchHotelDetails();
    }, [navigate]);

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!showDropdown) return;
        
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown]);

    const handleClick = () => {
        if (showDropdown) {
            setIsOpen(!isOpen);
        } else {
            navigate('/view-profile');
        }
    };

    const handleViewProfile = () => {
        const isStaff = localStorage.getItem('isStaff') === 'true';
        if (isStaff) {
            navigate('/staff-profile');
        } else {
            navigate('/view-profile');
        }
        setIsOpen(false);
    };

    const handleEditProfile = () => {
        navigate('/edit-profile');
        setIsOpen(false);
    };

    const isStaff = localStorage.getItem('isStaff') === 'true';

    return (
        <div className="hotel-logo-wrapper" ref={dropdownRef}>
            <div className={`hotel-logo ${className}`} onClick={handleClick}>
                {hotelDetails?.hotel_logo_url ? (
                    <img 
                        src={hotelDetails.hotel_logo_url} 
                        alt="Hotel Logo" 
                        className="logo-image"
                    />
                ) : (
                    <div className="logo-placeholder">
                        {isStaff 
                            ? (userDetails?.name?.charAt(0) || 'S')
                            : (hotelDetails?.hotel_name?.charAt(0) || 'H')
                        }
                    </div>
                )}
            </div>

            {showDropdown && isOpen && (
                <div className="hotel-logo-dropdown-menu">
                    <div className="hotel-logo-dropdown-header">
                        <div className="hotel-logo-profile-info">
                            <div className="hotel-logo-profile-image-container">
                                {!isStaff && hotelDetails?.hotel_logo_url ? (
                                    <img 
                                        src={hotelDetails.hotel_logo_url} 
                                        alt="Hotel Logo"
                                        className="hotel-logo-profile-image"
                                    />
                                ) : (
                                    <div className="hotel-logo-profile-image-placeholder">
                                        <FaUser />
                                    </div>
                                )}
                            </div>
                            <div className="hotel-logo-profile-text">
                                <span className="hotel-logo-user-name">{userDetails?.name}</span>
                                {!isStaff && <span className="hotel-logo-hotel-name">{hotelDetails?.hotel_name}</span>}
                                {isStaff && <span className="hotel-logo-staff-role">Staff Member</span>}
                            </div>
                        </div>
                    </div>
                    <div className="hotel-logo-dropdown-divider"></div>
                    <button onClick={handleViewProfile} className="hotel-logo-dropdown-item">
                        <FaUser className="hotel-logo-dropdown-icon" />
                        <span>View Profile</span>
                    </button>
                    {!isStaff && (
                        <button onClick={handleEditProfile} className="hotel-logo-dropdown-item">
                            <FaEdit className="hotel-logo-dropdown-icon" />
                            <span>Edit Profile</span>
                        </button>
                    )}
                    <button onClick={() => { navigate('/change-password'); setIsOpen(false); }} className="hotel-logo-dropdown-item">
                        <FaKey className="hotel-logo-dropdown-icon" />
                        <span>Change Password</span>
                    </button>
                    <div className="hotel-logo-dropdown-divider"></div>
                    <button 
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('userInfo');
                            localStorage.removeItem('isStaff');
                            localStorage.removeItem('permissions');
                            navigate('/login');
                        }} 
                        className="hotel-logo-dropdown-item hotel-logo-logout-item"
                    >
                        <FaSignOutAlt className="hotel-logo-dropdown-icon" />
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default HotelLogo;