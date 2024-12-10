import React from 'react';
import './MapComponent.css'; // Import the stylesheet

const Legend = ({ colorMapping, selectedFilter, handleFilterChange }) => {
  return (
    <div className="legend-container">
      {/* Logo Section */}
      <div className="legend-logo">
        <img src="/jlp-huc-logo.jpg" alt="Logo" />
      </div>
    {/* Title */}
    <h1>Mapping Jewish Ancestry and Migrations</h1>
      {/* Filter Dropdown */}
      <div className="legend-filter">
        <label htmlFor="filter">Filter by Primary Language Spoken:</label>
        <select id="filter" value={selectedFilter} onChange={handleFilterChange}>
          <option value="all">All</option>
          {Object.keys(colorMapping).map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      {/* Color Legend */}
      <div className="legend-items">
        <h4>Primary Languages Spoken</h4>
        {Object.entries(colorMapping).map(([lang, color]) => (
          <div key={lang} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: color }}></div>
            <span>{lang}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;
