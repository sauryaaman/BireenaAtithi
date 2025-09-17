import { useState, useEffect } from 'react';
import axios from 'axios';
import HotelLogo from '../components/HotelLogo/HotelLogo';
import { MdHotel, MdPeople, MdLogin, MdLogout, MdAdd } from 'react-icons/md';
import { BsFillCircleFill } from 'react-icons/bs';
import { RiHotelBedLine, RiDoorClosedLine, RiCalendarCheckLine } from 'react-icons/ri';
import { AiOutlineEye } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
const BASE_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
   const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    bookedRooms: 0,
    availableRooms: 0,
    currentGuests: 0,
    todayCheckins: 0,
    todayCheckouts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch dashboard statistics');
      console.error('Dashboard Error:', err);
    } finally {
      setLoading(false);
    }
  };


const StatCard = ({ title, value, icon: Icon, color, bgColor, actionIcon, onActionClick }) => (
    <div 
        className="stat-card" 
        style={{ borderColor: color }}
        onClick={onActionClick}
    >
        <div className="stat-icon" style={{ backgroundColor: bgColor }}>
            {Icon}
        </div>
        <div className="stat-info">
            <h3>{title}</h3>
            <p className="stat-value">
                {value}
            </p>
        </div>
        {actionIcon && (
            <span className="action-icon">
                {actionIcon}
            </span>
        )}
    </div>
);

  if (loading) return <div className="dashboard-loading">Loading statistics...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;
 const getOccupancyColor = (rate) => {
        if (rate >= 70) return '#4CAF50';
        if (rate >= 40) return '#FFA726';
        return '#EF5350';
    };

    const calculateOccupancyRate = () => {
        if (!stats) return 0;
        return ((stats.occupiedRooms / stats.totalRooms) * 100).toFixed(1);
    };

  return (
    <div className="dashboard-container">
      {/* <h1>Hotel Dashboard</h1> */}
      
      <div className="stats-section">
        <div className="dashboard-header">
          <h1>Hotel Dashboard</h1>
          <div className="profile-section">
            <HotelLogo className="dashboard-logo" />
          </div>
        </div>
        <div className="stats-grid">
          <StatCard
            title="Total Rooms"
            value={stats.totalRooms}
            icon={<MdHotel size={24} />}
            color="#4CAF50"
            bgColor="#E8F5E9"
            actionIcon={<AiOutlineEye size={20} />}
            onActionClick={() => navigate('/rooms')}
          />
          <StatCard
            title="Occupied Rooms"
            value={stats.occupiedRooms}
            icon={<BsFillCircleFill size={24} />}
            color="#F44336"
            bgColor="#FFEBEE"
          />
          <StatCard
            title="Booked Rooms"
            value={stats.bookedRooms}
            icon={<BsFillCircleFill size={24} />}
            color="#FFC107"
            bgColor="#FFF8E1"
          />
          <StatCard
            title="Available Rooms"
            value={stats.availableRooms}
            icon={<BsFillCircleFill size={24} />}
            color="#4CAF50"
            bgColor="#E8F5E9"
             actionIcon={<MdAdd size={20} />}
            onActionClick={() => navigate('/bookings/new')}
          />
        </div>
      </div>

      <div className="stats-section">
        <h2>Guest Statistics</h2>
        <div className="stats-grid">
          <StatCard
            title="Current Guests"
            value={stats.currentGuests}
            icon={<MdPeople size={24} />}
            color="#2196F3"
            bgColor="#E3F2FD"
          />
          <StatCard
            title="Today's Check-ins"
            value={stats.todayCheckins}
            icon={<MdLogin size={24} />}
            color="#9C27B0"
            bgColor="#F3E5F5"
          />
          <StatCard
            title="Today's Check-outs"
            value={stats.todayCheckouts}
            icon={<MdLogout size={24} />}
            color="#FF9800"
            bgColor="#FFF3E0"
          />
        </div>
      </div>
         {/* Third Section - Occupancy Rate */}
            <div className="dashboard-section">
                <div className="occupancy-card">
                    <h3>Occupancy Rate</h3>
                    <div className="progress-container">
                        <div 
                            className="progress-bar"
                            style={{
                                width: `${calculateOccupancyRate()}%`,
                                backgroundColor: getOccupancyColor(calculateOccupancyRate())
                            }}
                        >
                            <span className="progress-text">{calculateOccupancyRate()}%</span>
                        </div>
                    </div>
                </div>
            </div>

           {/* Fourth Section - Room Distribution */}
            <div className="dashboard-section">
                <div className="distribution-card">
                    <h3>Room Status Distribution</h3>
                    <div className="stacked-bar-container">
                        <div 
                            className="stacked-bar occupied"
                            style={{
                                width: `${(stats?.occupiedRooms / stats?.totalRooms) * 100}%`
                            }}
                        >
                            <span>{stats?.occupiedRooms} Occupied</span>
                        </div>
                         <div 
                            className="stacked-bar booked"
                            style={{
                                width: `${(stats?.bookedRooms / stats?.totalRooms) * 100}%`
                            }}
                        >
                            <span>{stats?.bookedRooms} Booked</span>
                        </div>
                        <div 
                            className="stacked-bar available"
                            style={{
                                width: `${(stats?.availableRooms / stats?.totalRooms) * 100}%`
                            }}
                        >
                            <span>{stats?.availableRooms} Available</span>
                        </div>
                    </div>
                      <div className="distribution-legend">
                        <div className="legend-item">
                            <span className="legend-color occupied"></span>
                            <span>Occupied</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color booked"></span>
                            <span>Booked</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color available"></span>
                            <span>Available</span>
                        </div>
                    </div>
                </div>
            </div>
        







            
    </div>
  );
};

export default Dashboard;
