import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RoomManagement.css';
import {
  RiEdit2Line,
  RiDeleteBinLine,
  RiAddLine,
  RiSearchLine,
  RiFilterLine,
  RiUserLine,
  RiPhoneLine,
  RiMailLine,
  RiCalendarLine,
  RiCloseCircleLine
} from 'react-icons/ri';
const BASE_URL = import.meta.env.VITE_API_URL; 

const RoomManagement = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [showRoomDetailsModal, setShowRoomDetailsModal] = useState(false);
  const [selectedRoomForDetails, setSelectedRoomForDetails] = useState(null);
  const [roomHistory, setRoomHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showRoomDetailsPage, setShowRoomDetailsPage] = useState(false);
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [customerFilters, setCustomerFilters] = useState({
    checkinDate: '',
    checkoutDate: '',
    paymentStatus: 'all'
  });
  const [filteredHistory, setFilteredHistory] = useState([]);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    roomType: 'all',
    availability: 'all',
  });

  // Form Data State
  const [formData, setFormData] = useState({
    room_number: '',
    room_type: 'standard',
    price_per_night: '',
    capacity: 1,
    status: 'Available'
  });
  const [modalError, setModalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch rooms function
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get(`${BASE_URL}/api/rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // console.log('Rooms data:', response.data);
      setRooms(response.data);
      setFilteredRooms(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch rooms');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch room history (all customers who stayed in this room)
  const fetchRoomHistory = async (roomId) => {
    try {
      setLoadingHistory(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/rooms/${roomId}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Room history response:', response.data);
      setRoomHistory(response.data || []);
    } catch (err) {
      console.error('Error fetching room history:', err);
      setRoomHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Filter room history based on selected filters
  useEffect(() => {
    if (roomHistory.length === 0) {
      setFilteredHistory([]);
      return;
    }

    let filtered = [...roomHistory];

    // Filter by check-in date
    if (customerFilters.checkinDate) {
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.checkin_date).toLocaleDateString('en-IN');
        const filterDate = new Date(customerFilters.checkinDate).toLocaleDateString('en-IN');
        return bookingDate === filterDate;
      });
    }

    // Filter by check-out date
    if (customerFilters.checkoutDate) {
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.checkout_date).toLocaleDateString('en-IN');
        const filterDate = new Date(customerFilters.checkoutDate).toLocaleDateString('en-IN');
        return bookingDate === filterDate;
      });
    }

    // Filter by payment status
    if (customerFilters.paymentStatus !== 'all') {
      filtered = filtered.filter(booking => 
        booking.payment_status?.toLowerCase() === customerFilters.paymentStatus.toLowerCase()
      );
    }

    setFilteredHistory(filtered);
  }, [roomHistory, customerFilters]);
  const handleRoomCardClick = (room) => {
    setSelectedRoomForDetails(room);
    setShowRoomDetailsPage(true);
    fetchRoomHistory(room.room_id);
  };

  // Handle room addition
  const handleAddRoom = async (e) => {
    e.preventDefault();
    setModalError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/api/rooms`, { ...formData, status: 'Available' }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setShowAddModal(false);
      setFormData({
        room_number: '',
        room_type: 'standard',
        price_per_night: '',
        status: 'Available'
      });
      setSuccessMessage('Room added successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchRooms();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add room';
      setModalError(errorMsg);
    }
  };

  // Handle room update
  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    setModalError(null);
    try {
      const token = localStorage.getItem('token');
      
      // Check if room is occupied or booked - cannot edit these rooms
      const currentRoom = rooms.find(room => room.room_id === editingRoom.room_id);
      if (currentRoom?.status === 'OCCUPIED' || currentRoom?.status === 'BOOKED') {
        setModalError(`Cannot edit a room that is ${currentRoom.status.toLowerCase()}`);
        return;
      }

      await axios.put(`${BASE_URL}/api/rooms/${editingRoom.room_id}`, {
        ...formData,
        status: formData.status || 'Available'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setEditingRoom(null);
      setShowAddModal(false);
      setSuccessMessage('Room updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchRooms();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update room');
    }
  };

  // Handle room deletion
  const handleDeleteRoom = async (roomId) => {
    // Find the room to check its status
    const roomToDelete = rooms.find(room => room.room_id === roomId);
    
    if (roomToDelete?.status === 'OCCUPIED' || roomToDelete?.status === 'BOOKED') {
      alert(`Cannot delete a room that is ${roomToDelete.status.toLowerCase()}`);
      return;
    }

    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${BASE_URL}/api/rooms/${roomId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        fetchRooms();
      } catch (err) {
        // console.log('Error deleting room:', err);
        setError(err.response?.data?.message || 'Failed to delete room');
      }
    }
  };

  // Handle edit button click
  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.room_number,
      room_type: room.room_type,
      price_per_night: room.price_per_night,
      capacity: room.capacity || 1,
      status: room.status || 'Available'
    });
    setShowAddModal(true);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Handle search and filters
  useEffect(() => {
    let result = [...rooms];
    
    // Apply search
    if (searchQuery) {
      result = result.filter(room => 
        room.room_number.toString().includes(searchQuery) ||
        room.room_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply filters
    if (filters.roomType !== 'all') {
      result = result.filter(room => room.room_type === filters.roomType);
    }
      if (filters.availability !== 'all') {
        result = result.filter(room => room.status?.toUpperCase() === filters.availability.toUpperCase());
      }    setFilteredRooms(result);
  }, [searchQuery, filters, rooms]);

  // Initial fetch and setup room status change listener
  useEffect(() => {
    fetchRooms();
    
    const handleRoomStatusChange = () => {
      // console.log('Room status changed, refreshing...');
      fetchRooms();
    };
    
    window.addEventListener('roomStatusChanged', handleRoomStatusChange);
    
    return () => {
      window.removeEventListener('roomStatusChanged', handleRoomStatusChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loader"></div>
        <p>Loading rooms...</p>
      </div>
    );
  }

  // Show Room Details Page instead of room grid
  if (showRoomDetailsPage && selectedRoomForDetails) {
    return (
      <div className="room-management">
        <div className="room-details-page">
          {/* Back Button */}
          <div className="details-header">
            <button 
              className="back-button" 
              onClick={() => {
                setShowRoomDetailsPage(false);
                setSelectedRoomForDetails(null);
                setRoomHistory([]);
              }}
            >
              ← Back to Rooms
            </button>
          </div>

          {/* Room Info Section */}
          <div className="details-room-info">
            <div className="room-info-header">
              <h1>Room {selectedRoomForDetails.room_number}</h1>
              <span className={`status-badge status-${selectedRoomForDetails.status}`}>
                {selectedRoomForDetails.status === 'UnderMaintenance' ? 'Under Maintenance' : selectedRoomForDetails.status}
              </span>
            </div>

            <div className="room-info-grid">
              <div className="info-card">
                <span className="label">Room Type</span>
                <span className="value">{selectedRoomForDetails.room_type?.replace(/_/g, ' ')}</span>
              </div>
              <div className="info-card">
                <span className="label">Capacity</span>
                <span className="value">{selectedRoomForDetails.capacity || 1} persons</span>
              </div>
              <div className="info-card">
                <span className="label">Price/Night</span>
                <span className="value">₹{selectedRoomForDetails.price_per_night}</span>
              </div>
              <div className="info-card">
                <span className="label">Current Status</span>
                <span className="value">{selectedRoomForDetails.status}</span>
              </div>
            </div>
          </div>

          {/* Customer History Section */}
          <div className="details-history-section">
            <div className="history-header">
              <h2>Customer History</h2>
              <span className="count-badge">{filteredHistory.length}</span>
            </div>

            {loadingHistory ? (
              <div className="loading-text">
                <div className="loader"></div>
                <p>Loading customer history...</p>
              </div>
            ) : roomHistory && roomHistory.length > 0 ? (
              <>
                {/* Filters */}
                <div className="customer-filters">
                  <div className="filter-group">
                    <label>Check-in Date:</label>
                    <input
                      type="date"
                      value={customerFilters.checkinDate}
                      onChange={(e) => setCustomerFilters({...customerFilters, checkinDate: e.target.value})}
                    />
                  </div>
                  <div className="filter-group">
                    <label>Check-out Date:</label>
                    <input
                      type="date"
                      value={customerFilters.checkoutDate}
                      onChange={(e) => setCustomerFilters({...customerFilters, checkoutDate: e.target.value})}
                    />
                  </div>
                  <div className="filter-group">
                    <label>Payment Status:</label>
                    <select
                      value={customerFilters.paymentStatus}
                      onChange={(e) => setCustomerFilters({...customerFilters, paymentStatus: e.target.value})}
                    >
                      <option value="all">All</option>
                      <option value="paid">Paid</option>
                      <option value="partial">Partial</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </div>
                  {(customerFilters.checkinDate || customerFilters.checkoutDate || customerFilters.paymentStatus !== 'all') && (
                    <button 
                      className="clear-filters-btn"
                      onClick={() => setCustomerFilters({checkinDate: '', checkoutDate: '', paymentStatus: 'all'})}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                {/* Customer Cards */}
                <div className="customer-history-list">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((booking, index) => (
                      <div 
                        key={index} 
                        className={`customer-card-compact ${expandedCustomer === index ? 'expanded' : ''}`}
                        onClick={() => setExpandedCustomer(expandedCustomer === index ? null : index)}
                      >
                        {/* Card Header - Always Visible */}
                        <div className="card-header-compact">
                          <div className="card-main-info">
                            <h4>{booking.customers?.name || 'N/A'}</h4>
                            <div className="card-meta">
                              <span className="date-info">
                                {new Date(booking.checkin_date).toLocaleDateString('en-IN')} to {new Date(booking.checkout_date).toLocaleDateString('en-IN')}
                              </span>
                              <span className="amount-info">₹{booking.total_amount}</span>
                            </div>
                          </div>
                          <div className="card-badges">
                            <span className={`payment-status ${booking.payment_status?.toLowerCase()}`}>
                              {booking.payment_status}
                            </span>
                            <span className={`booking-status ${booking.status?.toLowerCase()}`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>

                        {/* Expandable Content */}
                        {expandedCustomer === index && (
                          <div className="card-expanded-content">
                            <div className="expanded-section">
                              <h5>Customer Details</h5>
                              <div className="detail-row">
                                <span className="detail-label">Phone:</span>
                                <span className="detail-value">{booking.customers?.phone || 'N/A'}</span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-label">Email:</span>
                                <span className="detail-value">{booking.customers?.email || 'N/A'}</span>
                              </div>
                            </div>
                            <div className="expanded-section">
                              <h5>Payment Details</h5>
                              <div className="detail-row">
                                <span className="detail-label">Total Amount:</span>
                                <span className="detail-value">₹{booking.total_amount}</span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-label">Amount Paid:</span>
                                <span className="detail-value positive">₹{booking.amount_paid || 0}</span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-label">Amount Due:</span>
                                <span className="detail-value negative">₹{booking.amount_due || 0}</span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-label">Guests:</span>
                                <span className="detail-value">{booking.no_of_guests || 1}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="no-results">
                      <p>No customers found matching the selected filters.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="no-history">
                <p>No customer history found for this room.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="room-management">
      {/* Header */}
      {/* <div className="header">
        <h1>Room Management</h1>
        <div className="profile-section">

        </div>
      </div> */}

      {/* Search and Filters */}
      <div className="search-filter-section">
        <div className="search-bar">
          <RiSearchLine />
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filters">
          <select
            value={filters.roomType}
            onChange={(e) => setFilters({...filters, roomType: e.target.value})}
          >
            <option value="all">All Types</option>
            <optgroup label="Standard Rooms">
              <option value="AC_SINGLE">AC Single Room</option>
              <option value="AC_DOUBLE">AC Double Room</option>
              <option value="NONAC_SINGLE">Non-AC Single Room</option>
              <option value="NONAC_DOUBLE">Non-AC Double Room</option>
              {/* <option value="SINGLE_OCCUPANCY">Single Occupancy Room</option>
              <option value="CLUB_DOUBLE_OCCUPANCY">Club Double Occupancy Room</option> */}

            </optgroup>
            <optgroup label="Deluxe Rooms">
              <option value="DELUXE_AC_SINGLE">Deluxe AC Single Room</option>
              <option value="DELUXE_AC_DOUBLE">Deluxe AC Double Room</option>
              <option value="DELUXE_SUITE">Deluxe Suite Room</option>
            </optgroup>
            
            <optgroup label="Deluxe Rooms">
              <option value="DELUXE_AC_SINGLE">Deluxe AC Single Room</option>
              <option value="DELUXE_AC_DOUBLE">Deluxe AC Double Room</option>
              <option value="DELUXE_NONAC_SINGLE">Deluxe Non-AC Single Room</option>
              <option value="DELUXE_NONAC_DOUBLE">Deluxe Non-AC Double Room</option>
            </optgroup>
            <optgroup label="Suite Rooms">
              <option value="SUITE_SINGLE">Suite Single Room</option>
              <option value="SUITE_DOUBLE">Suite Double Room</option>
              <option value="SUITE_FAMILY">Family Suite</option>
            </optgroup>
          </select>
          <select
            value={filters.availability}
            onChange={(e) => setFilters({...filters, availability: e.target.value})}
          >
            <option value="all">All Status</option>
            <option value="Available">Available</option>
            <option value="Booked">Booked</option>
            <option value="Occupied">Occupied</option>
            <option value="UnderMaintenance">Under Maintenance</option>
          </select>
        </div>
      </div>

      {/* Room Grid */}
      <div className="room-grid">
        {filteredRooms.map((room) => (
          <div 
            key={room.room_id} 
            className={`room-card room-status-${room.status || 'Available'}`}
            onClick={() => handleRoomCardClick(room)}
            style={{ cursor: 'pointer' }}
          >
            <div className="room-number">Room {room.room_number}</div>
            <div className="room-type">
              {room.room_type?.replace('DELUXE_', 'Deluxe ')
                            .replace('SUITE_', 'Suite ')
                            .replace('AC_', 'AC ')
                            .replace('NONAC_', 'Non-AC ')
                            .replace(/_/g, ' ')
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                            .join(' ')}
            </div>
            <div className="room-capacity">Capacity: {room.capacity || 1} persons</div>
            <div className={`status-indicator status-${room.status || 'Available'}`}>
              {room.status === 'Available' ? 'Available' : 
               room.status === 'Booked' ? 'Booked' : 
               room.status === 'Occupied' ? 'Occupied' : 
               room.status === 'UnderMaintenance' ? 'Under Maintenance' :
               'Available'}
            </div>
            <div className="room-actions">
              {room.status?.toUpperCase() === 'OCCUPIED' || room.status?.toUpperCase() === 'BOOKED' ? (
                <div className="occupied-message">
                  {room.status === 'Occupied' ? 'Room is currently occupied' : 'Room is currently booked'}
                </div>
              ) : (
                <>
                  <button className="edit-button" onClick={(e) => { e.stopPropagation(); handleEdit(room); }}>
                    <RiEdit2Line /> Edit
                  </button>
                  {/* <button className="delete-button" onClick={() => handleDeleteRoom(room.room_id)}>
                    <RiDeleteBinLine /> Delete
                  </button> */}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Room Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingRoom ? 'Edit Room' : 'Add New Room'}</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingRoom(null);
                  setModalError(null);
                }}
              >
                ×
              </button>
            </div>
            
            {/* Error Alert */}
            {modalError && (
              <div className="error-alert">
                <span>⚠️ {modalError}</span>
              </div>
            )}
            
            <form onSubmit={editingRoom ? handleUpdateRoom : handleAddRoom}>
              <div className="form-group">
                <label>Room Number *</label>
                <input
                  type="text"
                  value={formData.room_number}
                  onChange={(e) => setFormData({...formData, room_number: e.target.value})}
                  placeholder="e.g., 101, 102"
                  required
                />
              </div>
              <div className="form-group">
                <label>Room Type *</label>
                <select
                  value={formData.room_type}
                  onChange={(e) => setFormData({...formData, room_type: e.target.value})}
                  required
                >
                  <option value="">-- Select Room Type --</option>
                  <optgroup label="Standard Rooms">
                    <option value="AC_SINGLE">AC Single Room</option>
                    <option value="AC_DOUBLE">AC Double Room</option>
                    <option value="NONAC_SINGLE">Non-AC Single Room</option>
                    <option value="NONAC_DOUBLE">Non-AC Double Room</option>
                  </optgroup>
                  <optgroup label="Deluxe Rooms">
                    <option value="DELUXE_AC_SINGLE">Deluxe AC Single Room</option>
                    <option value="DELUXE_AC_DOUBLE">Deluxe AC Double Room</option>
                    <option value="DELUXE_NONAC_SINGLE">Deluxe Non-AC Single Room</option>
                    <option value="DELUXE_NONAC_DOUBLE">Deluxe Non-AC Double Room</option>
                  </optgroup>
                  <optgroup label="Suite Rooms">
                    <option value="SUITE_SINGLE">Suite Single Room</option>
                    <option value="SUITE_DOUBLE">Suite Double Room</option>
                    <option value="SUITE_FAMILY">Family Suite</option>
                  </optgroup>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price per Night (₹) *</label>
                  <input
                    type="number"
                    value={formData.price_per_night}
                    onChange={(e) => setFormData({...formData, price_per_night: e.target.value})}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Room Capacity *</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                    min="1"
                    max="10"
                    placeholder="1"
                    required
                  />
                </div>
              </div>
              {editingRoom && (
                <div className="form-group">
                  <label>Room Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    required
                  >
                    <option value="Available">Available</option>
                    <option value="UnderMaintenance">Under Maintenance</option>
                  </select>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setShowAddModal(false);
                  setEditingRoom(null);
                  setModalError(null);
                }}>Cancel</button>
                <button type="submit">{editingRoom ? 'Update' : 'Add'} Room</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Room Button */}
      <button className="add-room-button" onClick={() => {
        setEditingRoom(null);
        setFormData({
          room_number: '',
          room_type: 'standard',
          price_per_night: '',
          capacity: 1,
          status: 'Available'
        });
        setShowAddModal(true);
      }}>
        <RiAddLine />
      </button>

      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          <span>✓ {successMessage}</span>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;