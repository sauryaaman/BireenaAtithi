import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HotelLogo.css';

const BASE_URL = import.meta.env.VITE_API_URL;

const HotelLogo = ({ className = '' }) => {
    const navigate = useNavigate();
    const [hotelDetails, setHotelDetails] = useState(null);
    const [error, setError] = useState(null);

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

                const hotelResponse = await axios.get(`${BASE_URL}/api/users/hotel-details`, config);
                setHotelDetails(hotelResponse.data);
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

    const handleClick = () => {
        navigate('/view-profile');
    };

    return (
        <div className={`hotel-logo ${className}`} onClick={handleClick}>
            {hotelDetails?.hotel_logo_url ? (
                <img 
                    src={hotelDetails.hotel_logo_url} 
                    alt="Hotel Logo" 
                    className="logo-image"
                />
            ) : (
                <div className="logo-placeholder">
                    {hotelDetails?.hotelName?.[0] || 'H'}
                </div>
            )}
        </div>
    );
};

export default HotelLogo;