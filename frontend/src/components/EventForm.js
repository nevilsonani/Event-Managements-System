import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from './NotificationSystem';
import api from '../services/api';
import './EventForm.css';

const EventForm = () => {
  const navigate = useNavigate();
  const { showSuccess } = useNotification();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date_time: '',
    location: '',
    max_capacity: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert date to ISO string
      const eventData = {
        ...formData,
        date_time: new Date(formData.date_time).toISOString(),
        max_capacity: parseInt(formData.max_capacity)
      };

      await api.post('/events', eventData);
      showSuccess('Event created successfully!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Minimum 30 minutes from now
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="event-form">
      <h1>Create New Event</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="title">Event Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={255}
            placeholder="Enter event title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            maxLength={1000}
            placeholder="Describe your event..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date_time">Date & Time *</label>
            <input
              type="datetime-local"
              id="date_time"
              name="date_time"
              value={formData.date_time}
              onChange={handleChange}
              required
              min={getMinDateTime()}
            />
          </div>

          <div className="form-group">
            <label htmlFor="max_capacity">Maximum Capacity *</label>
            <input
              type="number"
              id="max_capacity"
              name="max_capacity"
              value={formData.max_capacity}
              onChange={handleChange}
              required
              min="1"
              max="1000"
              placeholder="Enter max capacity"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            maxLength={255}
            placeholder="Enter event location"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
