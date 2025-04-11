import React, { useState, useEffect } from 'react';
import './notification.css';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose?: () => void;
  duration?: number; // Duration in ms, defaults to 3000
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 3000
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide the notification after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 300); // Wait for fade-out animation
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Handle close button click
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(onClose, 300); // Wait for fade-out animation
    }
  };

  return (
    <div className={`notification ${type} ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="notification-content">
        {type === 'success' && <span className="notification-icon">✓</span>}
        {type === 'error' && <span className="notification-icon">✕</span>}
        {type === 'info' && <span className="notification-icon">ℹ</span>}
        <span className="notification-message">{message}</span>
      </div>
      <button className="notification-close" onClick={handleClose}>×</button>
    </div>
  );
};

export default Notification;