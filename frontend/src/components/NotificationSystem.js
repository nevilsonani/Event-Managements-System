import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import './NotificationSystem.css';

// Notification Context
const NotificationContext = createContext();

// Notification Provider Component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type,
      duration
    };

    setNotifications(prev => [...prev, notification]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const showSuccess = (message, duration = 4000) => addNotification(message, 'success', duration);
  const showError = (message, duration = 5000) => addNotification(message, 'error', duration);
  const showWarning = (message, duration = 4000) => addNotification(message, 'warning', duration);
  const showInfo = (message, duration = 3000) => addNotification(message, 'info', duration);

  const showConfirm = (message, onConfirm, onCancel = null) => {
    const confirmNotification = addNotification(message, 'warning', 0); // Don't auto-remove

    // Create confirmation buttons (this is a simplified approach)
    setTimeout(() => {
      if (window.confirm(message)) {
        onConfirm && onConfirm();
      } else {
        onCancel && onCancel();
      }
      removeNotification(confirmNotification);
    }, 100);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showConfirm
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Hook to use notifications
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Notification Container Component
const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

// Single Notification Component
const Notification = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleRemove = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  }, [onRemove, notification.id]);

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);

    // Auto remove after duration
    if (notification.duration > 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, notification.duration - 300); // Start exit animation before removal

      return () => clearTimeout(timer);
    }
  }, [notification.duration, handleRemove]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div
      className={`notification notification-${notification.type} ${
        isVisible ? 'notification-enter' : ''
      } ${isExiting ? 'notification-exit' : ''}`}
      onClick={handleRemove}
    >
      <div className="notification-icon">
        {getIcon(notification.type)}
      </div>
      <div className="notification-content">
        <div className="notification-message">
          {notification.message}
        </div>
      </div>
      <button
        className="notification-close"
        onClick={(e) => {
          e.stopPropagation();
          handleRemove();
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default NotificationProvider;
