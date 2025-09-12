import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import {
  RiEdit2Line,
  RiCloseLine,
  RiSave3Line,
  RiArrowLeftLine
} from 'react-icons/ri';
import './CustomerDetails.css';
const BASE_URL = import.meta.env.VITE_API_URL;

const CustomerDetails = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchCustomerDetails();
  }, [customerId]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const baseUrl = `${BASE_URL}/api`;
      const { data } = await axios.get(
        `${baseUrl}/customers/${customerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCustomer(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const formData = new FormData(event.target);
      const updateData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        id_proof: formData.get('id_proof')
      };

      // Add additional guests if they exist
      if (customer.bookings?.[0]?.additional_guests?.length > 0) {
        const additionalGuests = customer.bookings[0].additional_guests.map((_, index) => ({
          guest_name: formData.get(`additional_guests[${index}].guest_name`),
          phone: formData.get(`additional_guests[${index}].phone`),
          id_proof: formData.get(`additional_guests[${index}].id_proof`)
        }));
        updateData.additional_guests = additionalGuests;
      }

      const baseUrl = `${BASE_URL}/api`;
      await axios.put(
        `${baseUrl}/customers/${customerId}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsEditing(false);
      fetchCustomerDetails(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update customer');
    }
  };

  if (loading) return <div className="loading">Loading customer details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!customer) return <div className="error-message">Customer not found</div>;

  return (
    <div className="customer-details-page">
      <div className="header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <RiArrowLeftLine /> Back
        </button>
        <div className="header-content">
          <h1>{isEditing ? 'Edit Customer Details' : 'Customer Details'}</h1>
          {customer.bookings?.find(b => b.status === 'Checked-in') && !isEditing && (
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              <RiEdit2Line /> Edit Details
            </button>
          )}
        </div>
      </div>

      <form className="customer-form" onSubmit={handleSubmit}>
        {/* Primary Guest Information */}
        <div className="form-section">
          <h3>Primary Guest Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              {isEditing ? (
                <input 
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={customer.name}
                  required
                />
              ) : (
                <div className="form-value">{customer.name}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              {isEditing ? (
                <input 
                  type="tel"
                  id="phone"
                  name="phone"
                  defaultValue={customer.phone}
                  required
                />
              ) : (
                <div className="form-value">{customer.phone}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              {isEditing ? (
                <input 
                  type="email"
                  id="email"
                  name="email"
                  defaultValue={customer.email}
                />
              ) : (
                <div className="form-value">{customer.email || 'Not provided'}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="id_proof">ID Proof</label>
              {isEditing ? (
                <input 
                  type="text"
                  id="id_proof"
                  name="id_proof"
                  defaultValue={customer.id_proof}
                />
              ) : (
                <div className="form-value">{customer.id_proof || 'Not provided'}</div>
              )}
            </div>
          </div>
        </div>

        {/* Current/Latest Stay */}
        {customer.bookings?.[0] && (
          <div className="form-section">
            <h3>{customer.bookings[0].status === 'Checked-in' ? 'Current Stay Details' : 'Latest Stay Details'}</h3>
            <div className="stay-status">
              <span className={`status-badge status-${customer.bookings[0].status.toLowerCase()}`}>
                {customer.bookings[0].status}
              </span>
            </div>
            
            {/* Room Information */}
            <div className="rooms-section">
              <h4>Room Details</h4>
              <div className="rooms-grid">
                {customer.bookings[0].rooms.map((room, index) => (
                  <div key={index} className="room-card">
                    <div className="room-header">Room {room.room_number}</div>
                    <div className="room-details">
                      <div className="room-info">
                        <span className="label">Type:</span>
                        <span>{room.room_type}</span>
                      </div>
                      <div className="room-info">
                        <span className="label">Price/Night:</span>
                        <span>₹{room.price_per_night}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stay Duration */}
            <div className="form-grid">
              <div className="form-group">
                <label>Check-in Date</label>
                <div className="form-value">
                  {format(new Date(customer.bookings[0].checkin_date), 'dd MMM yyyy')}
                </div>
              </div>
              <div className="form-group">
                <label>Check-out Date</label>
                <div className="form-value">
                  {format(new Date(customer.bookings[0].checkout_date), 'dd MMM yyyy')}
                </div>
              </div>
              <div className="form-group">
                <label>Total Nights</label>
                <div className="form-value">
                  {Math.ceil((new Date(customer.bookings[0].checkout_date) - 
                    new Date(customer.bookings[0].checkin_date)) / (1000 * 60 * 60 * 24))} nights
                </div>
              </div>
            </div>

            {/* Additional Guests */}
            {customer.bookings[0].additional_guests?.length > 0 && (
              <div className="additional-guests-section">
                <h4>Additional Guests</h4>
                <div className="guests-grid">
                  {customer.bookings[0].additional_guests.map((guest, index) => (
                    <div key={index} className="guest-card">
                      <div className="guest-info">
                        <div className="form-group">
                          <label htmlFor={`guest_name_${index}`}>Guest Name</label>
                          {isEditing ? (
                            <input 
                              type="text"
                              id={`guest_name_${index}`}
                              name={`additional_guests[${index}].guest_name`}
                              defaultValue={guest.guest_name}
                              required
                            />
                          ) : (
                            <div className="form-value">{guest.guest_name}</div>
                          )}
                        </div>
                        <div className="form-group">
                          <label htmlFor={`guest_phone_${index}`}>Phone Number</label>
                          {isEditing ? (
                            <input 
                              type="tel"
                              id={`guest_phone_${index}`}
                              name={`additional_guests[${index}].phone`}
                              defaultValue={guest.phone}
                              required
                            />
                          ) : (
                            <div className="form-value">{guest.phone}</div>
                          )}
                        </div>
                        <div className="form-group">
                          <label htmlFor={`guest_id_proof_${index}`}>ID Proof</label>
                          {isEditing ? (
                            <input 
                              type="text"
                              id={`guest_id_proof_${index}`}
                              name={`additional_guests[${index}].id_proof`}
                              defaultValue={guest.id_proof}
                            />
                          ) : (
                            <div className="form-value">{guest.id_proof || 'Not provided'}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stay History */}
        <div className="form-section">
          <h3>Stay History</h3>
          <div className="history-grid">
            {customer.bookings?.slice(1).map((booking, index) => (
              <div key={index} className="history-card">
                <div className="history-header">
                  <div className="date-range">
                    {format(new Date(booking.checkin_date), 'dd MMM yyyy')} - 
                    {format(new Date(booking.checkout_date), 'dd MMM yyyy')}
                  </div>
                  <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="rooms-list">
                  {booking.rooms.map((room, roomIndex) => (
                    <div key={roomIndex} className="history-room-info">
                      <span>Room {room.room_number}</span>
                      <span className="separator">•</span>
                      <span>{room.room_type}</span>
                    </div>
                  ))}
                </div>
                {booking.additional_guests?.length > 0 && (
                  <div className="history-guests">
                    <small>Additional Guests: {booking.additional_guests.map(g => g.guest_name).join(', ')}</small>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {isEditing && (
          <div className="action-buttons">
            <button type="submit" className="save-button">
              <RiSave3Line /> Save Changes
            </button>
            <button type="button" className="cancel-button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default CustomerDetails;
