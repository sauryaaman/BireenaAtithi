import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RoomManagement.css';
import {
  RiEdit2Line,
  RiDeleteBinLine,
  RiAddLine,
  RiSearchLine,
  RiFilterLine
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
    capacity: 1
  }); // status will always be 'AVAILABLE'

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

  // Handle room addition
  const handleAddRoom = async (e) => {
    e.preventDefault();
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
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add room');
    }
  };

  // Handle room update
  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Check if room is occupied or booked
      const currentRoom = rooms.find(room => room.room_id === editingRoom.room_id);
      if (currentRoom?.status === 'OCCUPIED' || currentRoom?.status === 'BOOKED') {
        setError(`Cannot edit a room that is ${currentRoom.status.toLowerCase()}`);
        return;
      }

      await axios.put(`${BASE_URL}/api/rooms/${editingRoom.room_id}`, {
        ...formData,
        status: 'Available' // Ensure status stays AVAILABLE
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setEditingRoom(null);
      setShowAddModal(false);
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update room');
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
        console.log('Error deleting room:', err);
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
      capacity: room.capacity || 1
    }); // Removed status as it will always be 'AVAILABLE'
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

  return (
    <div className="room-management">
      {/* Header */}
      <div className="header">
        <h1>Room Management</h1>
        <div className="profile-section">

        </div>
      </div>

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
          </select>
        </div>
      </div>

      {/* Room Grid */}
      <div className="room-grid">
        {filteredRooms.map((room) => (
          <div key={room.room_id} className={`room-card room-status-${room.status || 'Available'}`}>
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
               'Available'}
            </div>
            <div className="room-actions">
              {room.status?.toUpperCase() === 'OCCUPIED' || room.status?.toUpperCase() === 'BOOKED' ? (
                <div className="occupied-message">
                  {room.status === 'Occupied' ? 'Room is currently occupied' : 'Room is currently booked'}
                </div>
              ) : (
                <>
                  <button className="edit-button" onClick={() => handleEdit(room)}>
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
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={editingRoom ? handleUpdateRoom : handleAddRoom}>
              <div className="form-group">
                <label>Room Number</label>
                <input
                  type="text"
                  value={formData.room_number}
                  onChange={(e) => setFormData({...formData, room_number: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Room Type</label>
                <select
                  value={formData.room_type}
                  onChange={(e) => setFormData({...formData, room_type: e.target.value})}
                >
                  <option value="">Select Room Type</option>
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
              <div className="form-group">
                <label>Price per Night</label>
                <input
                  type="text"
                  value={formData.price_per_night}
                  onChange={(e) => setFormData({...formData, price_per_night: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Room Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                  min="1"
                  max="10"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => {
                  setShowAddModal(false);
                  setEditingRoom(null);
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
          capacity: 1
        }); // Removed status as it will always be 'AVAILABLE'
        setShowAddModal(true);
      }}>
        <RiAddLine />
      </button>
    </div>
  );
};

export default RoomManagement;