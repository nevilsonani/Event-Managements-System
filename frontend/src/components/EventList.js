import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from './NotificationSystem';
import api from '../services/api';
import { format } from 'date-fns';
import EventSearch from './EventSearch';
import './EventList.css';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRegistrations, setUserRegistrations] = useState(new Set());
  const [registeringEvents, setRegisteringEvents] = useState(new Set());
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError, showConfirm } = useNotification();

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
      // If the endpoint doesn't exist, we'll handle gracefully
      if (err.response?.status === 404) {
        console.log('Registration endpoint not found, user has no registrations');
        setUserRegistrations(new Set());
      }
    }
  }, [user]);

  const fetchEvents = async (searchParams = null) => {
    try {
      setLoading(true);
      let url = '/events';

      if (searchParams && Object.keys(searchParams).length > 0) {
        const params = new URLSearchParams(searchParams);
        url = `/events/search?${params.toString()}`;
      }

      const response = await api.get(url);
      setEvents(response.data.events);
      setError(null);
    } catch (err) {
      setError('Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    if (user) {
      fetchUserRegistrations();
    }
  }, [user, fetchUserRegistrations]);

  const handleSearch = (searchParams) => {
    fetchEvents(searchParams);
  };

  const handleClearSearch = () => {
    fetchEvents();
  };

  const handleEditEvent = (event) => {
    // Navigate to edit form with event data
    navigate(`/edit-event/${event.id}`, { state: { event } });
  };

  const handleDeleteEvent = async (eventId) => {
    showConfirm(
      'Are you sure you want to delete this event? This action cannot be undone.',
      async () => {
        try {
          await api.delete(`/events/${eventId}`);
          showSuccess('Event deleted successfully!');
          fetchEvents(); // Refresh the list
        } catch (err) {
          showError(err.response?.data?.message || 'Failed to delete event');
        }
      }
    );
  };

  const handleRegister = async (eventId) => {
    console.log('Attempting to register for event:', eventId);
    setRegisteringEvents(prev => new Set([...prev, eventId]));

    try {
      const response = await api.post(`/events/${eventId}/register`);
      console.log('Registration successful:', response.data);
      // Update user registrations state
      setUserRegistrations(prev => new Set([...prev, eventId]));
      // Refresh events to update registration count
      fetchEvents();
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
      // Update user registrations state
      setUserRegistrations(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
      // Refresh events to update registration count
      fetchEvents();
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

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="event-list">
      <h1>Upcoming Events</h1>
      
      <EventSearch onSearch={handleSearch} onClear={handleClearSearch} />
      
      {events.length === 0 ? (
        <div className="no-events">
          <p>No upcoming events at the moment.</p>
          {user && (
            <p>Be the first to create an event!</p>
          )}
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
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

                             {user && (
                 <div className="event-actions">
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
                   
                   {/* Event Creator Actions */}
                   {user.id === event.created_by && (
                     <div className="creator-actions">
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
                   )}
                 </div>
               )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
