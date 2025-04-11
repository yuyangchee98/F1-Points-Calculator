import React, { useState, useEffect, useCallback } from 'react';
import Notification from './Notification';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

interface NotificationManagerProps {
  maxNotifications?: number;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({
  maxNotifications = 3
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Add a new notification
  const addNotification = useCallback((notification: Omit<NotificationItem, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    setNotifications(prev => {
      // Ensure we don't exceed max notifications
      const newNotifications = [
        { ...notification, id },
        ...prev
      ].slice(0, maxNotifications);
      
      return newNotifications;
    });
    
    return id;
  }, [maxNotifications]);

  // Remove a notification by ID
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Expose methods to window for global access
  useEffect(() => {
    // Create global notification methods
    const notifySuccess = (message: string, duration = 3000) => 
      addNotification({ message, type: 'success', duration });
      
    const notifyError = (message: string, duration = 4000) => 
      addNotification({ message, type: 'error', duration });
      
    const notifyInfo = (message: string, duration = 3000) => 
      addNotification({ message, type: 'info', duration });
    
    // Add methods to window
    window.notifications = {
      success: notifySuccess,
      error: notifyError,
      info: notifyInfo,
      remove: removeNotification
    };
    
    // Cleanup
    return () => {
      delete window.notifications;
    };
  }, [addNotification, removeNotification]);

  return (
    <>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </>
  );
};

// Extend Window interface to recognize our notification methods
declare global {
  interface Window {
    notifications?: {
      success: (message: string, duration?: number) => string;
      error: (message: string, duration?: number) => string;
      info: (message: string, duration?: number) => string;
      remove: (id: string) => void;
    };
  }
}

export default NotificationManager;