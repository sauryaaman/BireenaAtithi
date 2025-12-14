import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  RiDashboardLine,
  RiCalendarCheckLine,
  RiHotelLine,
  RiGroupLine,
  RiMenuLine,
  RiFileAddLine,
  RiLogoutBoxLine,
  RiMoneyDollarCircleLine,
  RiSettingsLine
} from 'react-icons/ri';
import './Navbar.css';

const Navbar = ({ hotelName, onMenuClick, isMenuOpen }) => {
  const location = useLocation();
  const [permissions, setPermissions] = useState(null);

  // Load permissions from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('permissions');
      if (raw) {
        const parsed = JSON.parse(raw);
        setPermissions(parsed);
      } else {
        setPermissions(null);
      }
    } catch (e) {
      setPermissions(null);
    }
  }, []);

  const menuItems = [
    { path: '/dashboard', icon: RiDashboardLine, text: 'Dashboard', permKey: null },
    { path: '/rooms', icon: RiHotelLine, text: 'Rooms', permKey: 'Rooms' },
    { path: '/bookings', icon: RiCalendarCheckLine, text: 'Bookings', permKey: 'Bookings' },
    { path: '/menu', icon: RiFileAddLine, text: 'Food Menu', permKey: 'FoodMenu' },
    { path: '/bookings/new', icon: RiFileAddLine, text: 'Add Booking', permKey: 'Add Bookings' },
    { path: '/customers', icon: RiGroupLine, text: 'Customers', permKey: 'Customers' },
    { path: '/settings', icon: RiSettingsLine, text: 'Settings', permKey: 'Users' },
    { path: '/cashier-report', icon: RiMoneyDollarCircleLine, text: 'Cashier Report', permKey: 'CashierReport' },
    { path: '/food-payment-report', icon: RiMoneyDollarCircleLine, text: 'Food Payment Report', permKey: 'FoodPaymentReport' },
  ];

  // Filter menu items based on permissions
  const filteredMenuItems = menuItems.filter(item => {
    // Dashboard always visible
    if (!item.permKey) return true;
    // If no frontend permissions are present, show all (assume admin)
    if (!permissions) return true;
    // Permissions may be stored as object { key: true } or array
    if (Array.isArray(permissions)) return permissions.includes(item.permKey);
    if (typeof permissions === 'object') return !!permissions[item.permKey];
    return true;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('permissions');
    localStorage.removeItem('owner_id');
    window.location.href = '/login';
  };

  return (
    <div className="navbar-container">
      <div className="navbar">
        <h2 className="navbar-logo">{hotelName}</h2>
        <button 
          className="menu-toggle" 
          onClick={onMenuClick}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <RiMenuLine />
        </button>
      </div>

      {/* Backdrop overlay when menu is open */}
      {isMenuOpen && (
        <div 
          className="navbar-backdrop" 
          onClick={onMenuClick}
          aria-hidden="true"
        />
      )}

      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav">
          {filteredMenuItems.map(item => (
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