import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import PageHeader from '../shared/PageHeader';
import './PageLayout.css';

const PageLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className={`layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar onCollapse={setIsSidebarCollapsed} />
      <div className="page-container">
        <PageHeader />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;
