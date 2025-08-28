import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);

    // Add a small delay for better UX
    setTimeout(() => {
      logout();
    }, 300);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🎉 Event Manager
        </Link>
        
        <div className="navbar-menu">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/events" className="nav-link">Events</Link>
              <Link to="/create-event" className="nav-link">Create Event</Link>
              <Link to="/my-registrations" className="nav-link">My Events</Link>
              <div className="user-info">
                <span className="user-name">Hello, {user.name}</span>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`logout-btn ${isLoggingOut ? 'logging-out' : ''}`}
                >
                  {isLoggingOut ? (
                    <>
                      <span className="logout-spinner">🔄</span>
                      Logging out...
                    </>
                  ) : (
                    'Logout'
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
