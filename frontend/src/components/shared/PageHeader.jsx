import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import HotelLogo from '../HotelLogo/HotelLogo';
import { 
  RiDashboardLine, 
  RiCalendarCheckLine, 
  RiHotelLine, 
  RiGroupLine, 
  RiFileAddLine,
  RiMoneyDollarCircleLine,
  RiSettingsLine
} from 'react-icons/ri';
import './PageHeader.css';

const PageHeader = () => {
  const location = useLocation();

  const pageRoutes = {
    '/dashboard': { name: 'Dashboard', icon: RiDashboardLine },
    '/rooms': { name: 'Rooms', icon: RiHotelLine },
    '/bookings': { name: 'Bookings', icon: RiCalendarCheckLine },
    '/bookings/new': { name: 'Add Booking', icon: RiFileAddLine },
    '/menu': { name: 'Food Menu', icon: RiFileAddLine },
    '/customers': { name: 'Customers', icon: RiGroupLine },
    '/settings': { name: 'Settings', icon: RiSettingsLine },
    '/cashier-report': { name: 'Cashier Report', icon: RiMoneyDollarCircleLine },
    '/food-payment-report': { name: 'Food Payment Report', icon: RiMoneyDollarCircleLine },
    '/view-profile': { name: 'Hotel Profile', icon: RiSettingsLine },
  };

  const { pageName, PageIcon } = useMemo(() => {
    const currentPath = location.pathname;
    
    // Check for exact match first
    if (pageRoutes[currentPath]) {
      return {
        pageName: pageRoutes[currentPath].name,
        PageIcon: pageRoutes[currentPath].icon
      };
    }

    // Check for partial matches (like /bookings/edit/123)
    if (currentPath.startsWith('/bookings/edit')) {
      return { pageName: 'Edit Booking', PageIcon: RiCalendarCheckLine };
    } else if (currentPath.startsWith('/bookings/')) {
      return { pageName: 'Booking Details', PageIcon: RiCalendarCheckLine };
    } else if (currentPath.startsWith('/rooms/')) {
      return { pageName: 'Room Details', PageIcon: RiHotelLine };
    } else if (currentPath.startsWith('/customers/')) {
      return { pageName: 'Customer Details', PageIcon: RiGroupLine };
    } else {
      return { pageName: 'Hotel Management', PageIcon: RiDashboardLine };
    }
  }, [location.pathname]);

  return (
    <header className="page-header">
      <div className="page-header-left">
        {PageIcon && <PageIcon className="page-header-icon" />}
        <h1 className="page-header-title">{pageName}</h1>
      </div>
      <div className="page-header-right">
        <HotelLogo className="page-header-logo" showDropdown={true} />
      </div>
    </header>
  );
};

export default PageHeader;
