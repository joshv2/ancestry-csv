// Sidebar.js
import React from 'react';

const Sidebar = ({ sidebarContent }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '12vh',
      right: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      border: '2px solid #000',
      padding: '10px',
      borderRadius: '8px',
      zIndex: 1000, // Make sure it's above the map
      width: '300px',
      height: 'auto',
      maxHeight: '90vh',
      overflowY: 'auto',
    }}>
      <h3>Details</h3>
      {sidebarContent || <p>Click on a point to show details</p>}
    </div>
  );
};

export default Sidebar;
