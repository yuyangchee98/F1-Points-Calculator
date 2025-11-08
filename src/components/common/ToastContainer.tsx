import React, { useState } from 'react';
import Toast from './Toast';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning';
  duration?: number;
  teamColor?: string;
  _addedAt?: number;
}

interface ToastContainerProps {
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}

export const toastService = {
  listeners: [] as ((toast: ToastMessage) => void)[],

  addToast: (message: string, type: 'info' | 'success' | 'warning' = 'info', duration = 3000, teamColor?: string) => {
    const toast: ToastMessage = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      duration,
      teamColor
    };

    toastService.listeners.forEach(listener => listener(toast));
    return toast.id;
  },

  addListener: (listener: (toast: ToastMessage) => void) => {
    toastService.listeners.push(listener);
    return () => {
      toastService.listeners = toastService.listeners.filter(l => l !== listener);
    };
  }
};

const ToastContainer: React.FC<ToastContainerProps> = ({ position = 'bottom-right' }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  React.useEffect(() => {
    const removeListener = toastService.addListener((toast) => {
      const now = Date.now();
      const recentToastWithSameMessage = toasts.find(t =>
        t.message === toast.message &&
        t._addedAt !== undefined && (now - t._addedAt < 500)
      );

      if (!recentToastWithSameMessage) {
        setToasts(prev => [...prev, {...toast, _addedAt: now}]);
      }
    });

    return () => removeListener();
  }, [toasts]);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right': return 'top-4 right-4';
      case 'top-left': return 'top-4 left-4';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'bottom-right':
      default: return 'bottom-4 right-4';
    }
  };

  const removeToast = (id: string) => {
    setToasts(toasts.filter(t => t.id !== id));
  };
  
  return (
    <div className={`fixed ${getPositionClasses()} z-50 flex flex-col gap-3 pointer-events-none w-80`}>
      {toasts.map((toast, index) => (
        <div key={toast.id} 
             className="pointer-events-auto transition-all duration-300 ease-in-out transform opacity-0 animate-toast-in" 
             style={{ zIndex: 1000 - index, animationDelay: `${index * 100}ms` }}>
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            teamColor={toast.teamColor}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;