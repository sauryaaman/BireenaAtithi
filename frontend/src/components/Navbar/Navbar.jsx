import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  RiDashboardLine,
  RiCalendarCheckLine,
  RiHotelLine,
  RiGroupLine,
  RiMenuLine,
  RiFileAddLine,
  RiLogoutBoxLine
} from 'react-icons/ri';
import './Navbar.css';

const Navbar = ({ hotelName, onMenuClick, isMenuOpen }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: RiDashboardLine, text: 'Dashboard' },
    { path: '/rooms', icon: RiHotelLine, text: 'Rooms' },
    { path: '/bookings', icon: RiCalendarCheckLine, text: 'Bookings' },
    { path: '/bookings/new', icon: RiFileAddLine, text: 'Add Booking' },
    { path: '/customers', icon: RiGroupLine, text: 'Customers' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="navbar-container">
      <div className="navbar">
        <h2 className="navbar-logo">{hotelName}</h2>
        <button className="menu-toggle" onClick={onMenuClick}>
          <RiMenuLine />
        </button>
      </div>

      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={onMenuClick}
            >
              <item.icon className="nav-icon" />
              <span className="nav-text">{item.text}</span>
            </Link>
          ))}
          <button className="logout-btn" onClick={handleLogout}>
            <RiLogoutBoxLine className="nav-icon" />
            <span className="nav-text">Logout</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;