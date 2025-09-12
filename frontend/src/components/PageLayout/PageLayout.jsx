import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import './PageLayout.css';

const PageLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className={`layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar onCollapse={setIsSidebarCollapsed} />
      <main className="page-container">
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
