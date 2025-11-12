import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  RiDashboardLine,
  RiCalendarCheckLine,
  RiHotelLine,
  RiGroupLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiFileAddLine,
  RiLogoutBoxLine,
  RiMoneyDollarCircleLine
} from 'react-icons/ri';
import Navbar from '../Navbar/Navbar';
import './Sidebar.css';

const BASE_URL = import.meta.env.VITE_API_URL;

const Sidebar = ({ onCollapse }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hotelName, setHotelName] = useState('');
  const location = useLocation();

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.hotel_name) {
          setHotelName(response.data.hotel_name);
        }
      } catch (error) {
        console.error('Error fetching hotel details:', error);
      }
    };

    fetchHotelDetails();
  }, []);

  const menuItems = [
    { path: '/dashboard', icon: RiDashboardLine, text: 'Dashboard' },
    { path: '/rooms', icon: RiHotelLine, text: 'Rooms' },
    { path: '/bookings', icon: RiCalendarCheckLine, text: 'Bookings' },
    { path: '/bookings/new', icon: RiFileAddLine, text: 'Add Booking' },
    { path: '/customers', icon: RiGroupLine, text: 'Customers' },
    { path: '/cashier-report', icon: RiMoneyDollarCircleLine, text: 'Cashier Report' },
  ];

  const handleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapse?.(newState);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <>
      <Navbar 
        hotelName={hotelName} 
        onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
        isMenuOpen={isMenuOpen}
      />
      
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2 className="logo">
            {isCollapsed ? hotelName.split(' ').map(word => word[0]).join('').slice(0, 2) : hotelName}
          </h2>
          <button 
            className="collapse-btn"
            onClick={handleCollapse}
          >
            {isCollapsed ? <RiMenuUnfoldLine /> : <RiMenuFoldLine />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <item.icon className="nav-icon" />
              <span className="nav-text">{item.text}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <RiLogoutBoxLine className="nav-icon" />
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
