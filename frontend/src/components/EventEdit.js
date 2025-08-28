import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useNotification } from './NotificationSystem';
import api from '../services/api';
import './EventForm.css';

const EventEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
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
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchEvent = useCallback(async () => {
    try {
      const response = await api.get(`/events/${id}`);
      const event = response.data.event;
      setFormData({
        title: event.title,
        description: event.description || '',
        date_time: new Date(event.date_time).toISOString().slice(0, 16),
        location: event.location,
        max_capacity: event.max_capacity.toString()
      });
    } catch (err) {
      setError('Failed to fetch event details');
      console.error('Error fetching event:', err);
    } finally {
      setInitialLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // If we have event data from navigation state, use it
    if (location.state?.event) {
      const event = location.state.event;
      setFormData({
        title: event.title,
        description: event.description || '',
        date_time: new Date(event.date_time).toISOString().slice(0, 16),
        location: event.location,
        max_capacity: event.max_capacity.toString()
      });
      setInitialLoading(false);
    } else {
      // Otherwise fetch the event data
      fetchEvent();
    }
  }, [id, location.state, fetchEvent]);

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
      const eventData = {
        ...formData,
        date_time: new Date(formData.date_time).toISOString(),
        max_capacity: parseInt(formData.max_capacity)
      };

      await api.put(`/events/${id}`, eventData);
      showSuccess('Event updated successfully!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now.toISOString().slice(0, 16);
  };

  if (initialLoading) {
    return <div className="loading">Loading event details...</div>;
  }

  return (
    <div className="event-form">
      <h1>✏️ Edit Event</h1>

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
            {loading ? 'Updating...' : 'Update Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventEdit;
