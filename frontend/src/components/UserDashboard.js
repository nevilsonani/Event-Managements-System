import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from './NotificationSystem';
import api from '../services/api';
import { format } from 'date-fns';
import './UserDashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError, showConfirm } = useNotification();
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [createdEvents, setCreatedEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [userRegistrations, setUserRegistrations] = useState(new Set());
  const [registeringEvents, setRegisteringEvents] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  // Define all functions before useEffect
  const fetchUserStats = async () => {
    try {
      const response = await api.get('/users/stats');
      setStats(response.data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setProfile({
        name: response.data.user.name,
        email: response.data.user.email
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreatedEvents = useCallback(async () => {
    try {
      const response = await api.get(`/events/creator/${user.id}`);
      setCreatedEvents(response.data.events);
    } catch (err) {
      console.error('Error fetching created events:', err);
    }
  }, [user.id]);

  const fetchAllEvents = async () => {
    try {
      const response = await api.get('/events');
      setAllEvents(response.data.events);
    } catch (err) {
      console.error('Error fetching all events:', err);
    }
  };

  const fetchUserRegistrations = useCallback(async () => {
    if (!user) return;

    try {
      console.log('Fetching user registrations for user:', user.id);
      const response = await api.get(`/events/users/${user.id}/registrations`);
      const registrations = response.data.registrations || [];
      const eventIds = new Set(registrations.map(r => r.event_id));
      console.log('User registered for events:', Array.from(eventIds));
      setUserRegistrations(eventIds);
    } catch (err) {
      console.error('Error fetching user registrations:', err);
      if (err.response?.status === 404) {
        console.log('Registration endpoint not found, user has no registrations');
        setUserRegistrations(new Set());
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchUserProfile();
      fetchCreatedEvents();
      fetchAllEvents();
      fetchUserRegistrations();
    }
  }, [user, fetchUserRegistrations, fetchCreatedEvents]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', profile);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (eventId) => {
    console.log('Attempting to register for event:', eventId);
    setRegisteringEvents(prev => new Set([...prev, eventId]));

    try {
      const response = await api.post(`/events/${eventId}/register`);
      console.log('Registration successful:', response.data);
      setUserRegistrations(prev => new Set([...prev, eventId]));
      fetchAllEvents(); // Refresh events to update registration count
      showSuccess('Successfully registered for event!');
    } catch (err) {
      console.error('Registration failed:', err.response?.data || err.message);
      showError(err.response?.data?.message || 'Failed to register for event');
    } finally {
      setRegisteringEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  const handleCancelRegistration = async (eventId) => {
    console.log('Attempting to cancel registration for event:', eventId);
    setRegisteringEvents(prev => new Set([...prev, eventId]));

    try {
      const response = await api.delete(`/events/${eventId}/register`);
      console.log('Cancellation successful:', response.data);
      setUserRegistrations(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
      fetchAllEvents(); // Refresh events to update registration count
      showSuccess('Registration cancelled successfully!');
    } catch (err) {
      console.error('Cancellation failed:', err.response?.data || err.message);
      showError(err.response?.data?.message || 'Failed to cancel registration');
    } finally {
      setRegisteringEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  const isUserRegistered = (event) => {
    return userRegistrations.has(event.id);
  };

  const handleEditEvent = (event) => {
    navigate(`/edit-event/${event.id}`, { state: { event } });
  };

  const handleDeleteEvent = async (eventId) => {
    showConfirm(
      'Are you sure you want to delete this event? This action cannot be undone.',
      async () => {
        try {
          await api.delete(`/events/${eventId}`);
          showSuccess('Event deleted successfully!');
          fetchCreatedEvents(); // Refresh the list
        } catch (err) {
          showError(err.response?.data?.message || 'Failed to delete event');
        }
      }
    );
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1>🎯 Welcome back, {user?.name}!</h1>
        <p>Here's your event management overview</p>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-grid">
        {/* Statistics Cards */}
        <div className="stats-section">
          <h2>📊 Your Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🎉</div>
              <div className="stat-content">
                <h3>{stats?.events_created || 0}</h3>
                <p>Events Created</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <h3>{stats?.events_registered || 0}</h3>
                <p>Events Registered</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⏰</div>
              <div className="stat-content">
                <h3>{stats?.upcoming_events || 0}</h3>
                <p>Upcoming Events</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="profile-section">
          <h2>👤 Profile Settings</h2>
          <form onSubmit={handleProfileUpdate} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary">
              💾 Update Profile
            </button>
          </form>
        </div>
      </div>

              <div className="quick-actions">
          <h2>⚡ Quick Actions</h2>
          <div className="actions-grid">
            <div className="action-card">
              <div className="action-icon">🎉</div>
              <h3>Create Event</h3>
              <p>Start organizing your next amazing event</p>
              <button onClick={() => navigate('/create-event')} className="btn btn-primary">Get Started</button>
            </div>
            
            <div className="action-card">
              <div className="action-icon">🔍</div>
              <h3>Browse Events</h3>
              <p>Discover exciting events in your area</p>
              <button onClick={() => navigate('/')} className="btn btn-secondary">Explore</button>
            </div>
            
            <div className="action-card">
              <div className="action-icon">📅</div>
              <h3>My Events</h3>
              <p>Manage your registrations and events</p>
              <button onClick={() => navigate('/my-registrations')} className="btn btn-secondary">View All</button>
            </div>
          </div>
        </div>

        {/* All Events Section */}
        <div className="all-events">
          <h2>🎪 Discover Events</h2>
          <p>Browse and register for upcoming events</p>

          {allEvents.length === 0 ? (
            <div className="no-events">
              <p>No events available at the moment.</p>
              <button onClick={() => navigate('/create-event')} className="btn btn-primary">
                Create the First Event
              </button>
            </div>
          ) : (
            <div className="events-grid">
              {allEvents.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <h3>{event.title}</h3>
                    <span className={`capacity-badge ${event.available_spots <= 0 ? 'full' : ''}`}>
                      {event.available_spots <= 0 ? 'Full' : `${event.available_spots} spots left`}
                    </span>
                  </div>

                  <p className="event-description">{event.description}</p>

                  <div className="event-details">
                    <div className="detail">
                      <span className="icon">📅</span>
                      <span>{format(new Date(event.date_time), 'PPP p')}</span>
                    </div>
                    <div className="detail">
                      <span className="icon">📍</span>
                      <span>{event.location}</span>
                    </div>
                    <div className="detail">
                      <span className="icon">👤</span>
                      <span>Created by {event.creator_name}</span>
                    </div>
                    <div className="detail">
                      <span className="icon">👥</span>
                      <span>{event.current_registrations}/{event.max_capacity} registered</span>
                    </div>
                  </div>

                  <div className="registration-status">
                    {isUserRegistered(event) ? (
                      <span className="status-registered">✓ Registered</span>
                    ) : (
                      <span className="status-available">
                        {event.available_spots <= 0 ? 'Event Full' : `${event.available_spots} spots available`}
                      </span>
                    )}
                  </div>

                  {isUserRegistered(event) ? (
                    <button
                      onClick={() => handleCancelRegistration(event.id)}
                      disabled={registeringEvents.has(event.id)}
                      className="btn btn-secondary"
                    >
                      {registeringEvents.has(event.id) ? 'Cancelling...' : 'Cancel Registration'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegister(event.id)}
                      disabled={event.available_spots <= 0 || registeringEvents.has(event.id)}
                      className="btn btn-primary"
                    >
                      {registeringEvents.has(event.id)
                        ? 'Registering...'
                        : event.available_spots <= 0
                          ? 'Event Full'
                          : 'Register'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Created Events Section */}
        <div className="created-events">
          <h2>🎉 Events I Created</h2>
          {createdEvents.length === 0 ? (
            <div className="no-events">
              <p>You haven't created any events yet.</p>
              <button onClick={() => navigate('/create-event')} className="btn btn-primary">
                Create Your First Event
              </button>
            </div>
          ) : (
            <div className="events-grid">
              {createdEvents.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <h3>{event.title}</h3>
                    <span className={`capacity-badge ${event.available_spots <= 0 ? 'full' : ''}`}>
                      {event.available_spots <= 0 ? 'Full' : `${event.available_spots} spots left`}
                    </span>
                  </div>

                  <p className="event-description">{event.description}</p>

                  <div className="event-details">
                    <div className="detail">
                      <span className="icon">📅</span>
                      <span>{format(new Date(event.date_time), 'PPP p')}</span>
                    </div>
                    <div className="detail">
                      <span className="icon">📍</span>
                      <span>{event.location}</span>
                    </div>
                    <div className="detail">
                      <span className="icon">👥</span>
                      <span>{event.current_registrations}/{event.max_capacity} registered</span>
                    </div>
                  </div>

                  <div className="event-actions">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="btn btn-secondary"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="btn btn-danger"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
};

export default UserDashboard;
