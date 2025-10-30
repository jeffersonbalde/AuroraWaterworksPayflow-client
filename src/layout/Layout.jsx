// layout/Layout.jsx - USING CSS PSEUDO-ELEMENT
import React, { useState, useEffect } from 'react';
import Topbar from './Topbar';
import Sidebar from './sidebar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const [sidebarToggled, setSidebarToggled] = useState(false);

  const toggleSidebar = () => {
    setSidebarToggled(!sidebarToggled);
  };

  const closeSidebar = () => {
    setSidebarToggled(false);
  };

  // Close sidebar when clicking on main content
  const handleMainClick = () => {
    if (window.innerWidth < 768 && sidebarToggled) {
      closeSidebar();
    }
  };

  // Apply CSS class to body for sidebar state
  useEffect(() => {
    const body = document.body;
    
    if (sidebarToggled) {
      body.classList.add('sb-sidenav-toggled');
    } else {
      body.classList.remove('sb-sidenav-toggled');
    }

    return () => {
      body.classList.remove('sb-sidenav-toggled');
    };
  }, [sidebarToggled]);

  return (
    <div className="sb-nav-fixed">
      <Topbar onToggleSidebar={toggleSidebar} />
      
      <div id="layoutSidenav">
        <div id="layoutSidenav_nav">
          <Sidebar onCloseSidebar={closeSidebar} />
        </div>
        
        <div id="layoutSidenav_content" onClick={handleMainClick}>
          <main>
            {children}
          </main>
          
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;