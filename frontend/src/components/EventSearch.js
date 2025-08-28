import React, { useState } from 'react';
import './EventSearch.css';

const EventSearch = ({ onSearch, onClear }) => {
  const [searchData, setSearchData] = useState({
    q: '',
    location: '',
    date_from: '',
    date_to: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const filteredData = Object.fromEntries(
      Object.entries(searchData).filter(([_, value]) => value !== '')
    );
    onSearch(filteredData);
  };

  const handleClear = () => {
    setSearchData({
      q: '',
      location: '',
      date_from: '',
      date_to: ''
    });
    onClear();
  };

  return (
    <div className="event-search">
      <div className="search-header">
        <h3>🔍 Search Events</h3>
        <p>Find the perfect events for you</p>
      </div>
      
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-row">
          <div className="search-group">
            <label htmlFor="q">Search</label>
            <input
              type="text"
              id="q"
              name="q"
              value={searchData.q}
              onChange={handleChange}
              placeholder="Search events by title or description..."
            />
          </div>
          
          <div className="search-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={searchData.location}
              onChange={handleChange}
              placeholder="Enter location..."
            />
          </div>
        </div>
        
        <div className="search-row">
          <div className="search-group">
            <label htmlFor="date_from">From Date</label>
            <input
              type="date"
              id="date_from"
              name="date_from"
              value={searchData.date_from}
              onChange={handleChange}
            />
          </div>
          
          <div className="search-group">
            <label htmlFor="date_to">To Date</label>
            <input
              type="date"
              id="date_to"
              name="date_to"
              value={searchData.date_to}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="search-actions">
          <button type="submit" className="btn btn-primary">
            🔍 Search Events
          </button>
          <button type="button" onClick={handleClear} className="btn btn-secondary">
            🗑️ Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventSearch;
