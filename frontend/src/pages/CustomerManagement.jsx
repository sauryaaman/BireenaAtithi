import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import {
  RiSearchLine,
  RiHistoryLine,
  RiEdit2Line,
  RiEyeLine,
  RiGroupLine,
  RiHotelLine,
  RiCloseLine,
  RiPhoneLine,
  RiMailLine,
  RiIdCardLine,
  RiSave3Line,
  RiArrowLeftLine
} from 'react-icons/ri';

import './CustomerManagement.css';
const BASE_URL = import.meta.env.VITE_API_URL;

const CustomerManagement = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('current');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Function to fetch customers based on filter
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      const baseUrl =`${BASE_URL}/api`;
      let endpoint;
      
      // Select endpoint based on filter
      switch (filter) {
        case 'current':
          endpoint = `${baseUrl}/customers/current`;
          break;
        case 'past':
          endpoint = `${baseUrl}/customers/past`;
          break;
        case 'all':
          endpoint = `${baseUrl}/customers`;
          break;
        default:
          endpoint = `${baseUrl}/customers`;
      }
      
      const { data } = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Transform data to ensure consistent structure and proper filtering
      const processedData = data.map(customer => {
        // Ensure bookings is always an array and properly structured
        const bookings = customer.bookings?.map(booking => ({
          ...booking,
          rooms: Array.isArray(booking.rooms) ? booking.rooms : [booking.rooms].filter(Boolean),
          additional_guests: Array.isArray(booking.additional_guests) 
            ? booking.additional_guests 
            : []
        })) || [];

        // Sort bookings by date (most recent first)
        const sortedBookings = bookings.sort((a, b) => 
          new Date(b.checkin_date) - new Date(a.checkin_date)
        );

        return {
          ...customer,
          bookings: sortedBookings
        };
      });
      
      setCustomers(processedData);
      if (processedData.length === 0) {
        setError('No customers found.');
      }
    } catch (err) {
      console.error('Customer fetch error:', err);
      const errorMessage = err.response?.data?.message 
        ? `Error: ${err.response.data.message}`
        : err.response?.data?.error
        ? `Server Error: ${err.response.data.error}`
        : err.message
        ? `Network Error: ${err.message}`
        : 'Failed to fetch customers. Please try again.';
      
      setError(errorMessage);
      // console.log('Full error details:', {
      //   status: err.response?.status,
      //   statusText: err.response?.statusText,
      //   data: err.response?.data,
      //   message: err.message
      // });
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [filter]);

  // Date filter state
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(customer => {
      // Apply search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const searchInAdditionalGuests = customer.bookings?.some(booking =>
          booking.additional_guests?.some(guest =>
            guest.guest_name.toLowerCase().includes(searchLower) ||
            guest.phone.includes(searchQuery)
          )
        );
        
        return (
          (customer?.name || '').toLowerCase().includes(searchLower) ||
          (customer?.phone || '').includes(searchQuery) ||
          (customer?.email || '').toLowerCase().includes(searchLower) ||
          searchInAdditionalGuests
        );
      }
      return true;
    })
    .filter(customer => {
      // Apply date filter
      if (dateFilter.startDate && dateFilter.endDate) {
        return customer.bookings?.some(booking =>
          new Date(booking.checkin_date) >= new Date(dateFilter.startDate) &&
          new Date(booking.checkout_date) <= new Date(dateFilter.endDate)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      
      switch (sortBy) {
        case 'name':
          return multiplier * (a.name || '').localeCompare(b.name || '');
        case 'visits':
          return multiplier * ((a.bookings?.length || 0) - (b.bookings?.length || 0));
        case 'checkin':
          const aCheckin = a.bookings?.find(b => b.status === 'Checked-in')?.checkin_date || '';
          const bCheckin = b.bookings?.find(b => b.status === 'Checked-in')?.checkin_date || '';
          return multiplier * (aCheckin.localeCompare(bCheckin));
        case 'checkout':
          const aCheckout = a.bookings?.find(b => b.status === 'Checked-in')?.checkout_date || '';
          const bCheckout = b.bookings?.find(b => b.status === 'Checked-in')?.checkout_date || '';
          return multiplier * (aCheckout.localeCompare(bCheckout));
        default:
          return 0;
      }
    });

  // Handle viewing customer details
  const handleViewDetails = async (customerId) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        `${BASE_URL}/api/customers/${customerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedCustomer(data);
      setShowDetailModal(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch customer details');
    }
  };

  // Handle edit customer
  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowEditModal(true);
  };

  // Handle update customer
  const handleUpdateCustomer = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      // Get form data
      const formData = new FormData(event.target);
      const customerData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        id_proof: formData.get('id_proof')
      };

      // Update customer info
      await axios.put(
        `${BASE_URL}/api/customers/${selectedCustomer.cust_id}`,
        customerData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update additional guests if any
      if (selectedCustomer.bookings?.[0]?.additional_guests?.length > 0) {
        const additionalGuests = selectedCustomer.bookings[0].additional_guests.map((_, index) => ({
          guest_name: formData.get(`additional_guests[${index}].guest_name`),
          phone: formData.get(`additional_guests[${index}].phone`),
          id_proof: formData.get(`additional_guests[${index}].id_proof`)
        }));

        await axios.put(
          `${BASE_URL}/api/customers/${selectedCustomer.cust_id}/additional-guests`,
          { additional_guests: additionalGuests },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Refresh data and close modal
      await fetchCustomers();
      setShowEditModal(false);
      setShowDetailModal(false);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Failed to update customer');
    }
  };

  return (
    <div className="customer-management">
      {/* Header Section */}
      {/* <div className="header">
        <h1>Customer Management</h1>

      </div> */}

      {/* Actions Section */}
      <div className="actions-section">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'current' ? 'active' : ''}`}
            onClick={() => setFilter('current')}
          >
            <RiHotelLine className="btn-icon" />
            <span>Current Guests</span>
            <div className="btn-description">Currently checked-in guests</div>
          </button>
          <button 
            className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
            onClick={() => setFilter('past')}
          >
            <RiHistoryLine className="btn-icon" />
            <span>Past Guests</span>
            <div className="btn-description">Previously checked-out guests</div>
          </button>
        </div>

        <div className="search-section">
          <div className="search-bar">
            <RiSearchLine />
            <input
              type="text"
              placeholder="Search by name, phone or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filter and Sort Section */}
      <div className="filter-sort-section">
        <div className="date-filters">
          <div className="date-range">
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
              placeholder="From Date"
            />
            <span>to</span>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
              placeholder="To Date"
            />
          </div>
        </div>

        <div className="sort-options">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="visits">Sort by Total Visits</option>
            <option value="checkin">Sort by Check-in Date</option>
            <option value="checkout">Sort by Check-out Date</option>
          </select>
          <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Customers Table */}
      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <div className="error-content">
            <RiCloseLine className="error-icon" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Loading customers...</span>
        </div>
      ) : error && !error.includes('No customers found') ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="customers-table-container">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Guest Details</th>
                <th>Room</th>
                <th>Stay Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => {
                const currentBooking = customer.bookings?.find(b => b.status === 'Checked-in');
                const lastBooking = customer.bookings?.[0];
                const booking = currentBooking || lastBooking;
                
                return (
                  <React.Fragment key={customer.cust_id}>
                    {/* Primary Guest Row */}
                    <tr className="primary-guest-row">
                      <td>
                        <div className="guest-details">
                          <div className="guest-name">
                            <span className="primary-tag">Primary Guest</span>
                            <h3>{customer.name}</h3>
                          </div>
                          <div className="guest-contact">
                            <div>
                              <span className="label">Phone:</span> {customer.phone}
                            </div>
                            {customer.email && (
                              <div>
                                <span className="label">Email:</span> {customer.email}
                              </div>
                            )}
                            {customer.id_proof && (
                              <div>
                                <span className="label">ID:</span> {customer.id_proof}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        {booking?.rooms?.[0] ? (
                          <div className="room-info">
                            <div className="room-number">Room {booking.rooms[0].room_number}</div>
                            <div className="room-type">{booking.rooms[0].room_type}</div>
                          </div>
                        ) : 'N/A'}
                      </td>
                      <td>
                        <div className="stay-duration">
                          {booking ? (
                            <>
                              <div className="check-dates">
                                <div>
                                  <span className="label">Check-in:</span>
                                  <br />
                                  {format(new Date(booking.checkin_date), 'dd MMM yyyy')}
                                </div>
                                <div>
                                  <span className="label">Check-out:</span>
                                  <br />
                                  {format(new Date(booking.checkout_date), 'dd MMM yyyy')}
                                </div>
                              </div>
                              <div className="nights">
                                ({Math.ceil((new Date(booking.checkout_date) - new Date(booking.checkin_date)) / (1000 * 60 * 60 * 24))} nights)
                              </div>
                            </>
                          ) : 'N/A'}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge status-${(booking?.status || '').toLowerCase()}`}>
                          {booking?.status || 'N/A'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="view-btn"
                          onClick={() => {
                            const processedCustomer = {
                              ...customer,
                              bookings: customer.bookings?.map(booking => ({
                                ...booking,
                                rooms: Array.isArray(booking.rooms) ? booking.rooms : [booking.rooms].filter(Boolean)
                              }))
                            };
                            setSelectedCustomer(processedCustomer);
                            setShowDetailModal(true);
                          }}
                          title="View Customer Details"
                        >
                          <RiEyeLine /> View
                        </button>
                        {booking?.status === 'Checked-in' && (
                          <button
                            className="edit-btn"
                            onClick={() => {
                              const processedCustomer = {
                                ...customer,
                                bookings: customer.bookings?.map(booking => ({
                                  ...booking,
                                  rooms: Array.isArray(booking.rooms) ? booking.rooms : [booking.rooms].filter(Boolean)
                                }))
                              };
                              setSelectedCustomer(processedCustomer);
                              setShowEditModal(true);
                            }}
                            title="Edit Customer Details"
                          >
                            <RiEdit2Line /> Edit
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Additional Guests */}
                    {booking?.additional_guests?.map((guest, index) => (
                      <tr key={`${customer.cust_id}-guest-${index}`} className="additional-guest-row">
                        <td>
                          <div className="guest-details">
                            <div className="guest-name">
                              <span className="additional-tag">Additional Guest {index + 1}</span>
                              <h3>{guest.guest_name}</h3>
                            </div>
                            <div className="guest-contact">
                              <div>
                                <span className="label">Phone:</span> {guest.phone}
                              </div>
                              {guest.id_proof && (
                                <div>
                                  <span className="label">ID:</span> {guest.id_proof}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="room-number">
                            {booking.rooms[0]?.room_number}
                          </div>
                        </td>
                        <td>
                          <div className="room-type">
                            {booking.rooms[0]?.room_type}
                            <span className="sharing-tag">(Sharing)</span>
                          </div>
                        </td>
                        <td>
                          <div className="stay-duration">
                            <div className="check-dates">
                              <div>Same as primary guest</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge status-${booking.status.toLowerCase()}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td></td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Detail View Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="modal-overlay">
          <div className="customer-detail-modal large-modal">
            <div className="modal-header">
              <button className="back-button" onClick={() => setShowDetailModal(false)}>
                <RiArrowLeftLine /> Back to List
              </button>
              <div className="header-actions">
                {selectedCustomer.bookings?.find(b => b.status === 'Checked-in') && (
                  <button 
                    className="edit-button"
                    onClick={() => {
                      setShowEditModal(true);
                      setShowDetailModal(false);
                    }}
                  >
                    <RiEdit2Line /> Edit Details
                  </button>
                )}
              </div>
            </div>
            
            <div className="modal-content">
              <div className="detail-form">
                {/* Primary Guest Information */}
                <div className="form-section">
                  <h3 className="section-title">Guest Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      <div className="form-value">{selectedCustomer.name}</div>
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <div className="form-value">
                        <RiPhoneLine className="form-icon" />
                        {selectedCustomer.phone || 'Not provided'}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <div className="form-value">
                        <RiMailLine className="form-icon" />
                        {selectedCustomer.email || 'Not provided'}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>ID Proof</label>
                      <div className="form-value">
                        <RiIdCardLine className="form-icon" />
                        {selectedCustomer.id_proof || 'Not provided'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current/Latest Stay */}
                {selectedCustomer.bookings?.[0] && (
                  <div className="form-section">
                    <h3 className="section-title">
                      {selectedCustomer.bookings[0].status === 'Checked-in' 
                        ? 'Current Stay Details' 
                        : 'Latest Stay Details'
                      }
                    </h3>
                    
                    <div className="booking-card">
                      <div className="booking-header">
                        <div className="booking-title">
                          <h4>Booking #{selectedCustomer.bookings[0].booking_id}</h4>
                          <span className={`status-badge ${selectedCustomer.bookings[0].status.toLowerCase()}`}>
                            {selectedCustomer.bookings[0].status}
                          </span>
                        </div>
                        <div className="booking-payment">
                          <span className="amount">₹{selectedCustomer.bookings[0].total_amount}</span>
                          <span className={`payment-badge ${selectedCustomer.bookings[0].payment_status?.toLowerCase()}`}>
                            {selectedCustomer.bookings[0].payment_status}
                          </span>
                        </div>
                      </div>

                      <div className="stay-info">
                        <div className="info-group">
                          <label>Check-in Date</label>
                          <div className="value">
                            {format(new Date(selectedCustomer.bookings[0].checkin_date), 'dd MMM yyyy')}
                          </div>
                        </div>
                        <div className="info-group">
                          <label>Check-out Date</label>
                          <div className="value">
                            {selectedCustomer.bookings[0].checkout_date 
                              ? format(new Date(selectedCustomer.bookings[0].checkout_date), 'dd MMM yyyy')
                              : 'Not checked out'
                            }
                          </div>
                        </div>
                        <div className="info-group">
                          <label>Total Nights</label>
                          <div className="value">
                            {Math.ceil((new Date(selectedCustomer.bookings[0].checkout_date || new Date()) - 
                              new Date(selectedCustomer.bookings[0].checkin_date)) / (1000 * 60 * 60 * 24))} nights
                          </div>
                        </div>
                      </div>

                      {/* Room Details */}
                      <div className="rooms-section">
                        <h4>Room Details</h4>
                        <div className="rooms-grid">
                          {selectedCustomer.bookings[0].rooms.map((room, index) => (
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

                      {/* Additional Guests */}
                      {selectedCustomer.bookings[0].additional_guests?.length > 0 && (
                        <div className="additional-guests-section">
                          <h4>Additional Guests</h4>
                          <div className="guests-grid">
                            {selectedCustomer.bookings[0].additional_guests.map((guest, index) => (
                              <div key={index} className="guest-card">
                                <div className="guest-info">
                                  <div className="form-group">
                                    <label>Guest Name</label>
                                    <div className="form-value">{guest.guest_name}</div>
                                  </div>
                                  {guest.phone && (
                                    <div className="form-group">
                                      <label>Phone Number</label>
                                      <div className="form-value">
                                        <RiPhoneLine className="form-icon" />
                                        {guest.phone}
                                      </div>
                                    </div>
                                  )}
                                  {guest.id_proof && (
                                    <div className="form-group">
                                      <label>ID Proof</label>
                                      <div className="form-value">
                                        <RiIdCardLine className="form-icon" />
                                        {guest.id_proof}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Stay History */}
                <div className="form-section">
                  <h3 className="section-title">Stay History</h3>
                  <div className="history-grid">
                    {selectedCustomer.bookings?.slice(1).map((booking, index) => (
                      <div key={index} className="booking-card">
                        <div className="booking-header">
                          <div className="booking-title">
                            <h4>Booking #{booking.booking_id}</h4>
                            <span className={`status-badge ${booking.status.toLowerCase()}`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="booking-payment">
                            <span className="amount">₹{booking.total_amount}</span>
                            <span className={`payment-badge ${booking.payment_status?.toLowerCase()}`}>
                              {booking.payment_status}
                            </span>
                          </div>
                        </div>

                        <div className="booking-dates">
                          <div className="date-group">
                            <label>Check-in</label>
                            <div className="date">
                              {format(new Date(booking.checkin_date), 'dd MMM yyyy')}
                            </div>
                          </div>
                          <div className="divider">→</div>
                          <div className="date-group">
                            <label>Check-out</label>
                            <div className="date">
                              {booking.checkout_date 
                                ? format(new Date(booking.checkout_date), 'dd MMM yyyy')
                                : 'Not checked out'
                              }
                            </div>
                          </div>
                        </div>

                        <div className="rooms-section">
                          <h5>Room Details</h5>
                          <div className="rooms-grid">
                            {booking.rooms.map((room, roomIndex) => (
                              <div key={roomIndex} className="room-card">
                                <div className="room-details">
                                  <div className="room-number">Room {room.room_number}</div>
                                  <div className="room-type">{room.room_type}</div>
                                  <div className="room-price">₹{room.price_per_night}/night</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {booking.additional_guests?.length > 0 && (
                          <div className="guests-section">
                            <h5>Additional Guests</h5>
                            <div className="guests-grid">
                              {booking.additional_guests.map((guest, index) => (
                                <div key={index} className="guest-card">
                                  <div className="guest-header">
                                    <div className="guest-name">{guest.guest_name}</div>
                                  </div>
                                  <div className="guest-details">
                                    {guest.phone && (
                                      <div className="guest-info">
                                        <RiPhoneLine className="guest-icon" />
                                        {guest.phone}
                                      </div>
                                    )}
                                    {guest.id_proof && (
                                      <div className="guest-info">
                                        <RiIdCardLine className="guest-icon" />
                                        {guest.id_proof}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="close-button" onClick={() => setShowDetailModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedCustomer && (
        <div className="modal-overlay">
          <div className="customer-detail-modal">
            <div className="modal-header">
              <h2>Edit Customer Details</h2>
              <button className="close-button" onClick={() => setShowEditModal(false)}>
                <RiCloseLine />
              </button>
            </div>
            
            <div className="modal-content">
              <form className="customer-form" onSubmit={handleUpdateCustomer}>
                {/* Primary Guest Information */}
                <div className="form-section">
                  <h3>Primary Guest Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="name">Full Name</label>
                      <input 
                        type="text"
                        id="name"
                        name="name"
                        defaultValue={selectedCustomer.name}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input 
                        type="tel"
                        id="phone"
                        name="phone"
                        defaultValue={selectedCustomer.phone}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input 
                        type="email"
                        id="email"
                        name="email"
                        defaultValue={selectedCustomer.email}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="id_proof">ID Proof</label>
                      <input 
                        type="text"
                        id="id_proof"
                        name="id_proof"
                        defaultValue={selectedCustomer.id_proof}
                      />
                    </div>
                  </div>
                </div>

                {/* Current Stay Additional Guests */}
                {selectedCustomer.bookings?.[0]?.additional_guests?.length > 0 && (
                  <div className="form-section">
                    <h3>Additional Guests</h3>
                    <div className="guests-grid">
                      {selectedCustomer.bookings[0].additional_guests.map((guest, index) => (
                        <div key={index} className="guest-card">
                          <div className="guest-info">
                            <div className="form-group">
                              <label htmlFor={`guest_name_${index}`}>Guest Name</label>
                              <input 
                                type="text"
                                id={`guest_name_${index}`}
                                name={`additional_guests[${index}].guest_name`}
                                defaultValue={guest.guest_name}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor={`guest_phone_${index}`}>Phone Number</label>
                              <input 
                                type="tel"
                                id={`guest_phone_${index}`}
                                name={`additional_guests[${index}].phone`}
                                defaultValue={guest.phone}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor={`guest_id_proof_${index}`}>ID Proof</label>
                              <input 
                                type="text"
                                id={`guest_id_proof_${index}`}
                                name={`additional_guests[${index}].id_proof`}
                                defaultValue={guest.id_proof}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="modal-footer">
                  <button type="submit" className="save-button">
                    <RiSave3Line /> Save Changes
                  </button>
                  <button type="button" className="cancel-button" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="modal-overlay">
          <div className="customer-detail-modal large-modal">
            <div className="modal-header">
              <button className="back-button" onClick={() => setShowDetailModal(false)}>
                <RiArrowLeftLine /> Back to List
              </button>
              <h2>Customer Details</h2>
              {selectedCustomer.bookings?.find(b => b.status === 'Checked-in') && (
                <button 
                  className="edit-button"
                  onClick={() => {
                    setShowEditModal(true);
                    setShowDetailModal(false);
                  }}
                >
                  <RiEdit2Line /> Edit Details
                </button>
              )}
            </div>
            
            <div className="modal-content">
              <div className="customer-form">
                {/* Primary Guest Information */}
                <div className="form-section">
                  <h3>Primary Guest Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      <div className="form-value">{selectedCustomer.name}</div>
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <div className="form-value">{selectedCustomer.phone}</div>
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <div className="form-value">{selectedCustomer.email || 'Not provided'}</div>
                    </div>
                    <div className="form-group">
                      <label>ID Proof</label>
                      <div className="form-value">{selectedCustomer.id_proof || 'Not provided'}</div>
                    </div>
                  </div>
                </div>

                {/* Current/Latest Stay */}
                {selectedCustomer.bookings?.[0] && (
                  <div className="form-section">
                    <h3>
                      {selectedCustomer.bookings[0].status === 'Checked-in' 
                        ? 'Current Stay Details' 
                        : 'Latest Stay Details'
                      }
                    </h3>
                    <div className="stay-status">
                      <span className={`status-badge status-${selectedCustomer.bookings[0].status.toLowerCase()}`}>
                        {selectedCustomer.bookings[0].status}
                      </span>
                    </div>
                    
                    {/* Room Information */}
                    <div className="rooms-section">
                      <h4>Room Details</h4>
                      <div className="rooms-grid">
                        {selectedCustomer.bookings[0].rooms.map((room, index) => (
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
                    <div className="stay-info">
                      <div className="info-group">
                        <label>Check-in Date</label>
                        <div className="value">
                          {format(new Date(selectedCustomer.bookings[0].checkin_date), 'dd MMM yyyy')}
                        </div>
                      </div>
                      <div className="info-group">
                        <label>Check-out Date</label>
                        <div className="value">
                          {format(new Date(selectedCustomer.bookings[0].checkout_date), 'dd MMM yyyy')}
                        </div>
                      </div>
                      <div className="info-group">
                        <label>Total Nights</label>
                        <div className="value">
                          {Math.ceil((new Date(selectedCustomer.bookings[0].checkout_date) - 
                            new Date(selectedCustomer.bookings[0].checkin_date)) / (1000 * 60 * 60 * 24))} nights
                        </div>
                      </div>
                    </div>

                    {/* Additional Guests */}
                    {selectedCustomer.bookings[0].additional_guests?.length > 0 && (
                      <div className="additional-guests-section">
                        <h4>Additional Guests</h4>
                        <div className="guests-grid">
                          {selectedCustomer.bookings[0].additional_guests.map((guest, index) => (
                            <div key={index} className="guest-card">
                              <div className="guest-info">
                                <div className="form-group">
                                  <label>Guest Name</label>
                                  <div className="form-value">{guest.guest_name}</div>
                                </div>
                                <div className="form-group">
                                  <label>Phone Number</label>
                                  <div className="form-value">{guest.phone}</div>
                                </div>
                                {guest.id_proof && (
                                  <div className="form-group">
                                    <label>ID Proof</label>
                                    <div className="form-value">{guest.id_proof}</div>
                                  </div>
                                )}
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
                    {selectedCustomer.bookings?.slice(1).map((booking, index) => (
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedCustomer && (
        <div className="modal-overlay">
          <div className="customer-detail-modal large-modal">
            <div className="modal-header">
              <button className="back-button" onClick={() => {
                setShowEditModal(false);
                setShowDetailModal(true);
              }}>
                <RiArrowLeftLine /> Back to Details
              </button>
              <h2>Edit Customer Details</h2>
            </div>
            
            <div className="modal-content">
              <form className="customer-form" onSubmit={handleUpdateCustomer}>
                {/* Primary Guest Information */}
                <div className="form-section">
                  <h3>Primary Guest Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="name">Full Name</label>
                      <input 
                        type="text"
                        id="name"
                        name="name"
                        defaultValue={selectedCustomer.name}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input 
                        type="tel"
                        id="phone"
                        name="phone"
                        defaultValue={selectedCustomer.phone}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input 
                        type="email"
                        id="email"
                        name="email"
                        defaultValue={selectedCustomer.email}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="id_proof">ID Proof</label>
                      <input 
                        type="text"
                        id="id_proof"
                        name="id_proof"
                        defaultValue={selectedCustomer.id_proof}
                      />
                    </div>
                  </div>
                </div>

                {/* Current Stay Additional Guests */}
                {selectedCustomer.bookings?.[0]?.additional_guests?.length > 0 && (
                  <div className="form-section">
                    <h3>Additional Guests</h3>
                    <div className="guests-grid">
                      {selectedCustomer.bookings[0].additional_guests.map((guest, index) => (
                        <div key={index} className="guest-card">
                          <div className="guest-info">
                            <div className="form-group">
                              <label htmlFor={`guest_name_${index}`}>Guest Name</label>
                              <input 
                                type="text"
                                id={`guest_name_${index}`}
                                name={`additional_guests[${index}].guest_name`}
                                defaultValue={guest.guest_name}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor={`guest_phone_${index}`}>Phone Number</label>
                              <input 
                                type="tel"
                                id={`guest_phone_${index}`}
                                name={`additional_guests[${index}].phone`}
                                defaultValue={guest.phone}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor={`guest_id_proof_${index}`}>ID Proof</label>
                              <input 
                                type="text"
                                id={`guest_id_proof_${index}`}
                                name={`additional_guests[${index}].id_proof`}
                                defaultValue={guest.id_proof}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="action-buttons">
                  <button type="submit" className="save-button">
                    <RiSave3Line /> Save Changes
                  </button>
                  <button 
                    type="button" 
                    className="cancel-button" 
                    onClick={() => {
                      setShowEditModal(false);
                      setShowDetailModal(true);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
