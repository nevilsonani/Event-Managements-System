import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from './NotificationSystem';
import api from '../services/api';
import { format } from 'date-fns';
import './UserRegistrations.css';

const UserRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/users/${user.id}/registrations`);
      setRegistrations(response.data.registrations);
      setError(null);
    } catch (err) {
      setError('Failed to fetch registrations');
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    if (user) {
      fetchRegistrations();
    }
  }, [user, fetchRegistrations]);

  const handleCancelRegistration = async (eventId) => {
    try {
      await api.delete(`/events/${eventId}/register`);
      // Refresh registrations
      fetchRegistrations();
      showSuccess('Registration cancelled successfully!');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to cancel registration');
    }
  };

  if (loading) {
    return <div className="loading">Loading your registrations...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="user-registrations">
      <h1>My Event Registrations</h1>
      
      {registrations.length === 0 ? (
        <div className="no-registrations">
          <p>You haven't registered for any events yet.</p>
          <p>Browse events and register for ones that interest you!</p>
        </div>
      ) : (
        <div className="registrations-grid">
          {registrations.map((registration) => (
            <div key={registration.id} className="registration-card">
              <div className="registration-header">
                <h3>{registration.title}</h3>
                <span className="status-badge confirmed">Confirmed</span>
              </div>
              
              <p className="event-description">{registration.description}</p>
              
              <div className="event-details">
                <div className="detail">
                  <span className="icon">📅</span>
                  <span>{format(new Date(registration.date_time), 'PPP p')}</span>
                </div>
                <div className="detail">
                  <span className="icon">📍</span>
                  <span>{registration.location}</span>
                </div>
                <div className="detail">
                  <span className="icon">👤</span>
                  <span>Created by {registration.creator_name}</span>
                </div>
                <div className="detail">
                  <span className="icon">📝</span>
                  <span>Registered on {format(new Date(registration.registration_date), 'PPP')}</span>
                </div>
              </div>

              <div className="registration-actions">
                <button
                  onClick={() => handleCancelRegistration(registration.event_id)}
                  className="btn btn-danger"
                >
                  Cancel Registration
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserRegistrations;
