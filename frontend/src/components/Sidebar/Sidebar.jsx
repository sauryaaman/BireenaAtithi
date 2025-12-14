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
  ,RiSettingsLine
} from 'react-icons/ri';
import Navbar from '../Navbar/Navbar';
import './Sidebar.css';

const BASE_URL = import.meta.env.VITE_API_URL;

const Sidebar = ({ onCollapse }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Read frontend-only permissions from localStorage (set at login)
  const [permissions, setPermissions] = useState(null);

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

  const handleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapse?.(newState);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('permissions');
    localStorage.removeItem('owner_id');
    window.location.href = '/login';
  };

  return (
    <>
      <Navbar 
        hotelName={hotelName} 
        onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMenuOpen={isMobileMenuOpen}
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
          {menuItems
            .filter(item => {
              // Dashboard always visible
              if (!item.permKey) return true;
              // If no frontend permissions are present, show all (assume admin)
              if (!permissions) return true;
              // Permissions may be stored as object { key: true } or array
              if (Array.isArray(permissions)) return permissions.includes(item.permKey);
              if (typeof permissions === 'object') return !!permissions[item.permKey];
              return true;
            })
            .map(item => (
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
