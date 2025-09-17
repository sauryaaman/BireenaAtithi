import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditProfile.css';

const BASE_URL = import.meta.env.VITE_API_URL;

const EditProfile = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        owner_phone: '',
        hotel_name: '',
        address_line1: '',
        
        city: '',
        state: '',
        country: '',
        pin_code: '',
        gst_number: '',
    });
    const [logo, setLogo] = useState(null);
    const [previewLogo, setPreviewLogo] = useState('');
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

                const [userResponse, hotelResponse] = await Promise.all([
                    axios.get(`${BASE_URL}/api/users/profile`, config),
                    axios.get(`${BASE_URL}/api/users/hotel-details`, config)
                ]);

                const userData = userResponse.data;
                const hotelData = hotelResponse.data || {};

                setFormData({
                    name: userData.name || '',
                    email: userData.email || '',
                    owner_phone: userData.owner_phone || '',
                    hotel_name: hotelData.hotel_name || userData.hotel_name || '',
                    
                    address_line1: hotelData.address_line1 || '',
                    city: hotelData.city || '',
                    state: hotelData.state || '',
                    country: hotelData.country || '',
                    pin_code: hotelData.pin_code || '',
                    gst_number: hotelData.gst_number || '',
                });

                if (hotelData.hotel_logo_url) {
                    setPreviewLogo(hotelData.hotel_logo_url);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
            setPreviewLogo(URL.createObjectURL(file));
        }
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const headers = {
            Authorization: `Bearer ${token}`
        };

        // console.log('Updating user profile with data:', { 
        //     name: formData.name,
        //     owner_phone: formData.owner_phone,
        //     hotel_name: formData.hotel_name
        // });
        const userUpdateData = {
            name: formData.name,
            owner_phone: formData.owner_phone,
            hotel_name: formData.hotel_name
        };

        try {
            // console.log('Sending user profile update:', userUpdateData);
            const userResponse = await axios.put(
                `${BASE_URL}/api/users/profile`,
                userUpdateData,
                { headers }
            );
            // console.log('User profile update successful:', userResponse.data);
        } catch (profileError) {
            console.error('Error updating user profile:', profileError);
            throw new Error(
                profileError.response?.data?.message || 
                'Failed to update user profile'
            );
        }

        // Validate required fields for hotel details
        const requiredFields = ['hotel_name', 'address_line1', 'city', 'state', 'country', 'pin_code'];
        for (let field of requiredFields) {
            if (!formData[field]) {
                throw new Error(`${field.replace('_', ' ')} is required`);
            }
        }

        // Validate PIN code format
        if (!/^\d{6}$/.test(formData.pin_code)) {
            throw new Error('PIN code must be 6 digits');
        }

        // Validate GST number if provided
        if (formData.gst_number && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst_number)) {
            throw new Error('Invalid GST number format');
        }

        // Create FormData for hotel details
        const formDataObj = new FormData();
        formDataObj.append('hotel_name', formData.hotel_name.trim());
        formDataObj.append('address_line1', formData.address_line1.trim());
        formDataObj.append('city', formData.city.trim());
        formDataObj.append('state', formData.state.trim());
        formDataObj.append('country', formData.country.trim());
        formDataObj.append('pin_code', formData.pin_code.trim());
        if (formData.gst_number) {
            formDataObj.append('gst_number', formData.gst_number.trim());
        }

        // Add logo if a new one is selected
        if (logo) {
            formDataObj.append('logo', logo);
            // console.log('Uploading new logo file:', logo.name);
        }

        // console.log('Updating hotel details with data:', {
        //     hotel_name: formData.hotel_name,
        //     address_line1: formData.address_line1,
        //     city: formData.city,
        //     state: formData.state,
        //     country: formData.country,
        //     pin_code: formData.pin_code,
        //     gst_number: formData.gst_number,
        //     hasLogo: !!logo
        // });

        // Send the hotel update with multipart/form-data
        // Send the hotel update
        // console.log('Sending hotel details update...');
        const updateResponse = await axios.put(
            `${BASE_URL}/api/users/hotel-details`,
            formDataObj,
            { 
                headers: {
                    ...headers,
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        // console.log('Hotel details update response:', updateResponse.data);

        // If both updates are successful, navigate to view profile
        navigate('/view-profile');
    } catch (error) {
        console.error('Error updating profile:', error);
        const errorMessage = error.response?.data?.message 
            || error.response?.data?.error 
            || error.message 
            || 'Error updating profile';
        setError(errorMessage);
        
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
        }
    }
};

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="edit-profile">
            <h1>Edit Profile</h1>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-sections">
                    {/* User Details Section */}
                    <div className="form-section">
                        <h2>User Information</h2>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    name="owner_phone"
                                    value={formData.owner_phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Hotel Details Section */}
                    <div className="form-section">
                        <h2>Hotel Information</h2>
                        
                        <div className="logo-upload">
                            <label>Hotel Logo</label>
                            <div className="logo-preview">
                                {previewLogo && (
                                    <img src={previewLogo} alt="Hotel Logo Preview" />
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                            />
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Hotel Name</label>
                                <input
                                    type="text"
                                    name="hotel_name"
                                    value={formData.hotel_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <input
                                    type="text"
                                    name="address_line1"
                                    value={formData.address_line1}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>PIN Code</label>
                                <input
                                    type="text"
                                    name="pin_code"
                                    value={formData.pin_code}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>GST Number</label>
                                <input
                                    type="text"
                                    name="gst_number"
                                    value={formData.gst_number}
                                    onChange={handleChange}
                                    pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
                                    title="Please enter a valid GST number"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/view-profile')} className="cancel-button">
                        Cancel
                    </button>
                    <button type="submit" className="save-button">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfile;