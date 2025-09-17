import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import './PageLayout.css';

const PageLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className={`layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar onCollapse={setIsSidebarCollapsed} />
      <div className="page-container">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
