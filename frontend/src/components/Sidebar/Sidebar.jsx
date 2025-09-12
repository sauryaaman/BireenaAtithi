import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  RiDashboardLine,
  RiCalendarCheckLine,
  RiHotelLine,
  RiGroupLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiFileAddLine,
  RiLogoutBoxLine
} from 'react-icons/ri';
import './Sidebar.css';

const Sidebar = ({ onCollapse }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: RiDashboardLine, text: 'Dashboard' },
    { path: '/rooms', icon: RiHotelLine, text: 'Rooms' },
    { path: '/bookings', icon: RiCalendarCheckLine, text: 'Bookings' },
    { path: '/bookings/new', icon: RiFileAddLine, text: 'Add Booking' },
    { path: '/customers', icon: RiGroupLine, text: 'Customers' },
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
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2 className="logo">
          {isCollapsed ? 'HA' : 'Hotel Advin'}
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
  );
};

export default Sidebar;
