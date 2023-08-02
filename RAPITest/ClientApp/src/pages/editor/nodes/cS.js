import React, { useState } from 'react';
import './cS.css'; // Create this CSS file for styling

const CollapsibleSidebar = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prevState) => !prevState);
  };

  return (
    <div className={`collapsible-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="toggle-button" onClick={toggleSidebar}>
        Toggle Sidebar
      </button>
      <div className="sidebar-content">
        
      {children}
      </div>
    </div>
  );
};

export default CollapsibleSidebar;