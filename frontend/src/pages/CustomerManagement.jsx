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
      if (searchQuery && searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        
        // Check additional guests
        const searchInAdditionalGuests = customer.bookings?.some(booking =>
          booking.additional_guests?.some(guest =>
            (guest?.guest_name || '').toLowerCase().includes(searchLower) ||
            (guest?.phone || '').toString().includes(searchQuery)
          )
        ) || false;
        
        return (
          (customer?.name || '').toLowerCase().includes(searchLower) ||
          (customer?.phone || '').toString().includes(searchQuery) ||
          (customer?.email || '').toLowerCase().includes(searchLower) ||
          searchInAdditionalGuests
        );
      }
      return true;
    })
    .filter(customer => {
      // Apply date filter
      if (dateFilter?.startDate && dateFilter?.endDate) {
        try {
          const startDate = new Date(dateFilter.startDate);
          const endDate = new Date(dateFilter.endDate);
          
          return customer.bookings?.some(booking => {
            const checkinDate = new Date(booking.checkin_date);
            const checkoutDate = new Date(booking.checkout_date);
            return checkinDate >= startDate && checkoutDate <= endDate;
          }) || false;
        } catch (err) {
          console.error('Date filter error:', err);
          return true;
        }
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
          <form className="search-bar" onSubmit={(e) => e.preventDefault()}>
            <RiSearchLine />
            <input
              type="text"
              placeholder="Search by name, phone or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
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

      {/* Customer Details Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="customer-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-v2">
              <div className="header-left">
                <h1 className="modal-title">{selectedCustomer.name}</h1>
                {selectedCustomer.bookings?.[0]?.status === 'Checked-in' && (
                  <span className="status-active">Currently Checked-in</span>
                )}
              </div>
              <button 
                className="close-btn-v2" 
                onClick={() => setShowDetailModal(false)}
              >
                <RiCloseLine />
              </button>
            </div>
            
            <div className="modal-content-v2">
              <div className="details-grid-v2">
                {/* Guest Info Card */}
                <div className="detail-card">
                  <div className="card-header">
                    <RiPhoneLine className="card-icon" />
                    <h3>Contact Information</h3>
                  </div>
                  <div className="card-content">
                    <div className="detail-row">
                      <span className="detail-label">Phone</span>
                      <span className="detail-value">{selectedCustomer.phone}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Email</span>
                      <span className="detail-value">{selectedCustomer.email || '—'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">ID Proof</span>
                      <span className="detail-value">{selectedCustomer.id_proof || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Current Stay Card */}
                {selectedCustomer.bookings?.[0] && (
                  <>
                    <div className="detail-card">
                      <div className="card-header">
                        <RiHotelLine className="card-icon" />
                        <h3>Current Stay</h3>
                      </div>
                      <div className="card-content">
                        <div className="detail-row">
                          <span className="detail-label">Room</span>
                          <span className="detail-value">
                            {selectedCustomer.bookings[0].rooms?.[0]?.room_number || '—'} 
                            {selectedCustomer.bookings[0].rooms?.[0]?.room_type && ` (${selectedCustomer.bookings[0].rooms[0].room_type})`}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Check-in</span>
                          <span className="detail-value">
                            {format(new Date(selectedCustomer.bookings[0].checkin_date), 'dd MMM yyyy')}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Check-out</span>
                          <span className="detail-value">
                            {format(new Date(selectedCustomer.bookings[0].checkout_date), 'dd MMM yyyy')}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Duration</span>
                          <span className="detail-value">
                            {Math.ceil((new Date(selectedCustomer.bookings[0].checkout_date) - 
                              new Date(selectedCustomer.bookings[0].checkin_date)) / (1000 * 60 * 60 * 24))} nights
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Guests Card */}
                    {selectedCustomer.bookings[0].additional_guests?.length > 0 && (
                      <div className="detail-card">
                        <div className="card-header">
                          <RiGroupLine className="card-icon" />
                          <h3>Additional Guests ({selectedCustomer.bookings[0].additional_guests.length})</h3>
                        </div>
                        <div className="card-content guests-list">
                          {selectedCustomer.bookings[0].additional_guests.map((guest, index) => (
                            <div key={index} className="guest-item">
                              <div className="guest-number">{index + 1}</div>
                              <div className="guest-details-v2">
                                <div className="guest-name-v2">{guest.guest_name}</div>
                                <div className="guest-phone-v2">{guest.phone}</div>
                                {guest.id_proof && <div className="guest-id-v2">{guest.id_proof}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Stay History Card */}
                {selectedCustomer.bookings?.length > 1 && (
                  <div className="detail-card full-width">
                    <div className="card-header">
                      <RiHistoryLine className="card-icon" />
                      <h3>Previous Stays ({selectedCustomer.bookings.length - 1})</h3>
                    </div>
                    <div className="card-content history-list-v2">
                      {selectedCustomer.bookings?.slice(1).map((booking, index) => (
                        <div key={index} className="history-item-v2">
                          <div className="history-dates">
                            {format(new Date(booking.checkin_date), 'dd MMM yyyy')} — {format(new Date(booking.checkout_date), 'dd MMM yyyy')}
                          </div>
                          <div className="history-rooms">
                            {booking.rooms.map((room, idx) => (
                              <span key={idx} className="room-badge">Room {room.room_number}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer-v2">
              {selectedCustomer.bookings?.find(b => b.status === 'Checked-in') && (
                <button 
                  className="btn-edit-v2"
                  onClick={() => {
                    setShowEditModal(true);
                    setShowDetailModal(false);
                  }}
                >
                  <RiEdit2Line /> Edit Details
                </button>
              )}
              <button 
                className="btn-close-v2"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="edit-modal-v2" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-v2">
              <h1 className="modal-title">Edit Customer Details</h1>
              <button 
                className="close-btn-v2" 
                onClick={() => setShowEditModal(false)}
              >
                <RiCloseLine />
              </button>
            </div>
            
            <div className="modal-content-v2 edit-content">
              <form className="edit-form-v2" onSubmit={handleUpdateCustomer}>
                {/* Primary Guest Section */}
                <div className="form-section-v2">
                  <div className="section-header">
                    <RiPhoneLine className="section-icon" />
                    <h3>Guest Information</h3>
                  </div>
                  
                  <div className="form-fields-grid">
                    <div className="form-field-v2">
                      <label htmlFor="name">Full Name *</label>
                      <input 
                        type="text"
                        id="name"
                        name="name"
                        defaultValue={selectedCustomer.name}
                        placeholder="Enter full name"
                        required
                        minLength={2}
                        pattern="[a-zA-Z\s]+"
                        title="Name should contain only letters and spaces"
                      />
                      <small className="help-text">Minimum 2 characters</small>
                    </div>

                    <div className="form-field-v2">
                      <label htmlFor="phone">Phone Number *</label>
                      <input 
                        type="tel"
                        id="phone"
                        name="phone"
                        defaultValue={selectedCustomer.phone}
                        placeholder="10-digit phone number"
                        required
                        pattern="[0-9]{10}"
                        title="Phone should be 10 digits"
                      />
                      <small className="help-text">10-digit number required</small>
                    </div>

                    <div className="form-field-v2">
                      <label htmlFor="email">Email Address</label>
                      <input 
                        type="email"
                        id="email"
                        name="email"
                        defaultValue={selectedCustomer.email || ''}
                        placeholder="example@email.com"
                        pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                        title="Please enter a valid email address"
                      />
                      <small className="help-text">Optional - valid format required</small>
                    </div>

                    <div className="form-field-v2">
                      <label htmlFor="id_proof">ID Proof</label>
                      <input 
                        type="text"
                        id="id_proof"
                        name="id_proof"
                        defaultValue={selectedCustomer.id_proof || ''}
                        placeholder="Passport, Aadhar, Driving License, etc."
                      />
                      <small className="help-text">Optional</small>
                    </div>
                  </div>
                </div>

                {/* Additional Guests Section */}
                {selectedCustomer.bookings?.[0]?.additional_guests?.length > 0 && (
                  <div className="form-section-v2">
                    <div className="section-header">
                      <RiGroupLine className="section-icon" />
                      <h3>Additional Guests ({selectedCustomer.bookings[0].additional_guests.length})</h3>
                    </div>

                    <div className="guests-form-grid">
                      {selectedCustomer.bookings[0].additional_guests.map((guest, index) => (
                        <div key={index} className="guest-form-card">
                          <div className="guest-form-header">Guest {index + 1}</div>
                          
                          <div className="guest-form-fields">
                            <div className="form-field-v2 small">
                              <label htmlFor={`guest_name_${index}`}>Name *</label>
                              <input 
                                type="text"
                                id={`guest_name_${index}`}
                                name={`additional_guests[${index}].guest_name`}
                                defaultValue={guest.guest_name}
                                placeholder="Guest name"
                                required
                                minLength={2}
                                pattern="[a-zA-Z\s]+"
                                title="Name should contain only letters and spaces"
                              />
                            </div>

                            <div className="form-field-v2 small">
                              <label htmlFor={`guest_phone_${index}`}>Phone *</label>
                              <input 
                                type="tel"
                                id={`guest_phone_${index}`}
                                name={`additional_guests[${index}].phone`}
                                defaultValue={guest.phone}
                                placeholder="10-digit"
                                required
                                pattern="[0-9]{10}"
                                title="Phone should be 10 digits"
                              />
                            </div>

                            <div className="form-field-v2 small">
                              <label htmlFor={`guest_id_proof_${index}`}>ID Proof</label>
                              <input 
                                type="text"
                                id={`guest_id_proof_${index}`}
                                name={`additional_guests[${index}].id_proof`}
                                defaultValue={guest.id_proof || ''}
                                placeholder="ID Proof"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="form-actions-v2">
                  <button 
                    type="submit" 
                    className="btn-submit-v2"
                  >
                    <RiSave3Line /> Save Changes
                  </button>
                  <button 
                    type="button" 
                    className="btn-cancel-v2"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                </div>

                {/* Info Message */}
                <div className="form-info-v2">
                  Fields marked with * are required
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
