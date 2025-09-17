import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import {
  RiAddLine,
  RiSearchLine,
  RiHistoryLine,
  RiEdit2Line,
  RiEyeLine,
  RiCloseLine,
  RiDownloadLine
} from 'react-icons/ri';

import './BookingManagement.css';
const BASE_URL = import.meta.env.VITE_API_URL;

const BookingManagement = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Function to refresh bookings data and notify room status changes
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const { data } = await axios.get(`${BASE_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (Array.isArray(data)) {
        setBookings(data);
        if (data.length === 0) {
          setError('No bookings found. Create a new booking to get started.');
        }
        
        // Notify room management to refresh
        window.dispatchEvent(new CustomEvent('roomStatusChanged'));
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Received invalid data from server');
      }
    } catch (err) {
      console.error('Booking fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter and sort bookings
  const filteredBookings = bookings
    .filter(booking => {
      // Apply status filter
      if (filter !== 'all') {
        const bookingStatus = (booking.status || '').toLowerCase();
        const filterStatus = filter.toLowerCase();
        console.log('Comparing status:', { bookingStatus, filterStatus });
        return bookingStatus === filterStatus;
      }
      return true;
    })
    .filter(booking => {
      // Apply search filter
      if (!searchQuery) return true;
      
      const searchLower = searchQuery.toLowerCase();
      return (
        (booking?.customer?.name || '').toLowerCase().includes(searchLower) ||
        (booking?.customer?.phone || '').includes(searchQuery) ||
        (booking?.primary_guest?.name || '').toLowerCase().includes(searchLower) ||
        (booking?.primary_guest?.phone || '').includes(searchQuery) ||
        (booking?.booking_id?.toString() || '').includes(searchQuery) ||
        (booking?.rooms?.[0]?.room_number?.toString() || '').includes(searchQuery)
      );
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.checkin_date) - new Date(a.checkin_date)
          : new Date(a.checkin_date) - new Date(b.checkin_date);
      } else if (sortBy === 'room') {
        return sortOrder === 'desc'
          ? b.room.room_number - a.room.room_number
          : a.room.room_number - b.room.room_number;
      }
      return 0;
    });

  // Calculate nights between dates
  const calculateNights = (checkin, checkout) => {
    return Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));
  };

  // Get status color class
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'checked-in': return 'status-green';
      case 'cancelled': return 'status-red';
      case 'checked-out': return 'status-blue';
      case 'upcoming': return 'status-yellow';
      default: return '';
    }
  };

  // Handle booking operations
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const handleEditBooking = (bookingId) => {
    navigate(`/booking/edit/${bookingId}`);
  };

  const handlePayment = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      // Convert payment status to uppercase
      const uppercaseStatus = newStatus.toUpperCase();
      await axios.put(
        `${BASE_URL}/api/bookings/${bookingId}/payment`,
        { payment_status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh bookings list
      await fetchBookings();
      
      // Show success message
      alert(`Payment status updated to ${newStatus}`);
    } catch (err) {
      console.error('Payment update error:', err);
      alert(err.response?.data?.message || 'Failed to update payment status');
    }
  };

  const handleCheckin = async (bookingId) => {
    if (!window.confirm('Are you sure you want to check in this booking?')) {
      return;
    }

    try {
      setError('');
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${BASE_URL}/api/bookings/${bookingId}/checkin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Broadcast event to refresh room status
      window.dispatchEvent(new CustomEvent('roomStatusChanged'));

      // Refresh bookings list
      await fetchBookings();
      alert('Check-in successful!');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to check in booking';
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  const handleCheckout = async (bookingId) => {
    if (!window.confirm('Are you sure you want to check out this booking?')) {
      return;
    }

    try {
      setError('');
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${BASE_URL}/api/bookings/${bookingId}/checkout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Broadcast an event to notify RoomManagement to refresh
      window.dispatchEvent(new CustomEvent('roomStatusChanged'));
      
      // Refresh bookings list
      await fetchBookings();
      alert('Checkout successful!');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to checkout booking';
      setError(errorMsg);
      alert(errorMsg);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh bookings list
      await fetchBookings();
      
      // Broadcast event to refresh room status
      window.dispatchEvent(new CustomEvent('roomStatusChanged'));
      
      alert('Booking deleted successfully');
    } catch (err) {
      console.error('Delete booking error:', err);
      alert(err.response?.data?.message || 'Failed to delete booking');
    }
  };

  const handleViewInvoice = async (bookingId) => {
    try {
      // console.log('Starting invoice download for booking:', bookingId);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // console.log('Making request to:', `${BASE_URL}/api/bookings/${bookingId}/invoice/download`);
      
      // First check if the invoice is available
      const checkResponse = await axios({
        url: `${BASE_URL}/api/bookings/${bookingId}/invoice/details`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // console.log('Invoice details check response:', checkResponse.data);

      // If we get here, invoice is available, now get the PDF
      const response = await axios({
        url: `${BASE_URL}/api/bookings/${bookingId}/invoice/download`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        },
        responseType: 'blob'
      });

      // console.log('PDF response received, type:', response.headers['content-type']);
      
      // Verify we got PDF data
      if (!response.data || response.data.size === 0) {
        throw new Error('Received empty PDF data');
      }

      // Create blob with explicit PDF type
      const blob = new Blob([response.data], { type: 'application/pdf' });
      // console.log('Created blob, size:', blob.size);

      // Create and open in new window instead of using link
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Open in new window where we can handle load errors
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(
          '<html><head><title>Invoice Preview</title></head><body style="margin:0;padding:0;">' +
          '<embed width="100%" height="100%" src="' + blobUrl + '" type="application/pdf">' +
          '</body></html>'
        );
      } else {
        // If popup was blocked, try iframe in current window
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.position = 'fixed';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.zIndex = '9999';
        iframe.src = blobUrl;
        
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.top = '0';
        container.style.left = '0';
        container.style.background = 'rgba(0,0,0,0.8)';
        container.style.zIndex = '9998';
        
        const closeButton = document.createElement('button');
        closeButton.innerText = 'Close';
        closeButton.style.position = 'fixed';
        closeButton.style.top = '20px';
        closeButton.style.right = '20px';
        closeButton.style.zIndex = '10000';
        closeButton.onclick = () => {
          document.body.removeChild(container);
          document.body.removeChild(closeButton);
          window.URL.revokeObjectURL(blobUrl);
        };
        
        document.body.appendChild(container);
        document.body.appendChild(closeButton);
        container.appendChild(iframe);
      }

    } catch (err) {
      console.error('Detailed error:', err);
      let errorMessage = 'Failed to fetch invoice.';
      
      if (err.response) {
        console.log('Error response:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
        
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
          navigate('/login');
        } else if (err.response.status === 400) {
          errorMessage = err.response.data?.error || 'Cannot generate invoice. Make sure payment is completed.';
        } else if (err.response.status === 404) {
          errorMessage = 'Invoice not found. Please make sure the booking exists.';
        } else if (err.response.status === 500) {
          errorMessage = 'Server error while generating invoice. Please try again.';
        }
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="booking-management">
      {/* Header Section */}
      <div className="header">
        <h1>Booking Management</h1>

      </div>
      <div>
    
      </div>

      {/* Actions Section */}
      <div className="actions-section">
        <div className="left-actions">
          <button 
            className="add-booking-btn"
            onClick={() => navigate('/bookings/new')}
          >
            <RiAddLine /> Add Booking
          </button>
          <button 
            className="view-history-btn"
            onClick={() => setFilter('checked-out')}
          >
            <RiHistoryLine /> View History
          </button>
        </div>

        <div className="search-section">
          <div className="search-bar">
            <RiSearchLine />
            <input
              type="text"
              placeholder="Search by name, phone or booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="status-tabs">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'checked-in' ? 'active' : ''}
            onClick={() => setFilter('checked-in')}
          >
            Current
          </button>
          <button 
            className={filter === 'upcoming' ? 'active' : ''}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={filter === 'checked-out' ? 'active' : ''}
            onClick={() => setFilter('checked-out')}
          >
            Past
          </button>
        </div>

        <div className="sort-options">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="room">Sort by Room</option>
          </select>
          <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="loading">Loading bookings...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="bookings-table-container">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Room</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Nights</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Bill</th>
                <th>Actions</th>
                <th>Edit/Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => (
                <tr key={booking.booking_id}>
                  <td>#{booking.booking_id || 'N/A'}</td>
                  <td>
                    <div className="customer-info">
                      <div>{booking?.customer?.name || booking?.primary_guest?.name || 'N/A'}</div>
                      <small>{booking?.customer?.phone || booking?.primary_guest?.phone || 'N/A'}</small>
                      {booking?.additional_guests?.length > 0 && (
                        <small className="additional-guests">+{booking.additional_guests.length} more guests</small>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="room-info">
                      {booking?.rooms?.map((room, index) => (
                        <div key={room.room_id} className={index > 0 ? 'mt-2' : ''}>
                          <div>Room {room.room_number}</div>
                          <small>{room.room_type} (₹{room.price_per_night}/night)</small>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>{booking.checkin_date ? format(new Date(booking.checkin_date), 'dd MMM yyyy') : 'N/A'}</td>
                  <td>{booking.checkout_date ? format(new Date(booking.checkout_date), 'dd MMM yyyy') : 'N/A'}</td>
                  <td>{booking.checkin_date && booking.checkout_date ? calculateNights(booking.checkin_date, booking.checkout_date) : 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <div className="payment-action">
                      {booking.payment_status !== 'PAID' ? (
                        <div>
                          <select
                            value={booking.payment_status}
                            onChange={(e) => handlePayment(booking.booking_id, e.target.value)}
                            className={`payment-status-select payment-${booking.payment_status?.toLowerCase()}`}
                          >
                            <option value="UNPAID">Unpaid</option>
                            <option value="PARTIAL">Partial</option>
                            <option value="PAID">Paid</option>
                          </select>
                        </div>
                      ) : (
                        <span className="payment-status payment-paid">
                          Paid
                        </span>
                      )}
                    </div>
                  </td>
                  <td>₹{booking.total_amount}</td>
                  <td>
                    <button 
                      onClick={() => handleViewInvoice(booking.booking_id)}
                      disabled={booking.payment_status?.toUpperCase() !== 'PAID'}
                      className={`view-invoice-btn ${booking.payment_status?.toUpperCase() !== 'PAID' ? 'disabled' : ''}`}
                      title={booking.payment_status?.toUpperCase() !== 'PAID' ? 'Complete payment to view invoice' : 'View/Download Invoice'}
                    >
                      <RiEyeLine />
                      <span className="icon-text">Invoice</span>
                    </button>
                  </td>
                  <td className="actions-cell">
                    <button
                      onClick={() => navigate(`/edit-booking/${booking.booking_id}`)}
                      className="edit-btn"
                      title="Edit Booking"
                    >
                      <RiEdit2Line />
                      <span className="icon-text">Edit</span>
                    </button>
                    {/* Check-in button for upcoming bookings */}
                    {booking.status?.toLowerCase() === 'upcoming' && (
                      <button 
                        onClick={() => handleCheckin(booking.booking_id)}
                        className="checkin-btn"
                        title="Check In Guest"
                      >
                        Check In
                      </button>
                    )}
                    {booking.status?.toLowerCase() === 'checked-in' && booking.payment_status?.toUpperCase() === 'PAID' && (
                      <button 
                        onClick={() => handleCheckout(booking.booking_id)}
                        className="checkout-btn"
                        title="Checkout Guest"
                      >
                        Checkout
                      </button>
                    )}
                    {booking.status?.toLowerCase() === 'checked-out' && (
                      <span className="checkout-complete">Completed</span>
                    )}
                  </td>
                  <td className="edit-delete-cell">
                    <button
                      onClick={() => navigate(`/booking/view/${booking.booking_id}`)}
                      className="edit-btn"
                      title="Edit Booking"
                    >
                      <RiEdit2Line />
                      <span className="icon-text">View</span>
                    </button>
                    {/* <button
                      onClick={() => handleDeleteBooking(booking.booking_id)}
                      className="delete-btn"
                      title="Delete Booking"
                    >
                      <RiCloseLine />
                      <span className="icon-text">Delete</span>
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Booking Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="modal-overlay">
          <div className="booking-detail-modal">
            <div className="modal-header">
              <h2>Booking Details #{selectedBooking.booking_id}</h2>
              <button onClick={() => setShowDetailModal(false)}>&times;</button>
            </div>
            
            <div className="modal-content">
              <div className="detail-section">
                <h3>Customer Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Name:</span>
                    <span>{selectedBooking.customer.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Phone:</span>
                    <span>{selectedBooking.customer.phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span>{selectedBooking.customer.email || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">ID Proof:</span>
                    <span>{selectedBooking.customer.id_proof || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Room Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Room Number:</span>
                    <span>{selectedBooking.room.room_number}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Room Type:</span>
                    <span>{selectedBooking.room.room_type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Price per Night:</span>
                    <span>₹{selectedBooking.room.price_per_night}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Booking Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Check-In:</span>
                    <span>{format(new Date(selectedBooking.checkin_date), 'dd MMM yyyy')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Check-Out:</span>
                    <span>{format(new Date(selectedBooking.checkout_date), 'dd MMM yyyy')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Nights:</span>
                    <span>{calculateNights(selectedBooking.checkin_date, selectedBooking.checkout_date)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className={`status-badge ${getStatusColor(selectedBooking.status)}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Payment Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Total Amount:</span>
                    <span>₹{selectedBooking.total_amount}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Paid Amount:</span>
                    <span>₹{selectedBooking.paid_amount}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Balance:</span>
                    <span>₹{selectedBooking.total_amount - selectedBooking.paid_amount}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Payment Status:</span>
                    <span className={`payment-status payment-${selectedBooking.payment_status.toLowerCase()}`}>
                      {selectedBooking.payment_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => navigate(`/bookings/${selectedBooking.booking_id}/invoice`)}>
                View Invoice
              </button>
              <button onClick={() => handleEditBooking(selectedBooking.booking_id)}>
                Edit Booking
              </button>
              <button onClick={() => setShowDetailModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
