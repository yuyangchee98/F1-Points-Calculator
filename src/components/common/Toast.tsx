import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  duration?: number;
  onClose?: () => void;
  type?: 'info' | 'success' | 'warning';
  teamColor?: string;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  duration = 3000, 
  onClose,
  type = 'info',
  teamColor
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);

      setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getStyleProps = () => {
    if (teamColor) {
      return {
        backgroundColor: teamColor,
        borderLeft: `5px solid ${teamColor}`,
        color: getContrastYIQ(teamColor),
      };
    }

    switch (type) {
      case 'success': return { className: 'bg-green-500' };
      case 'warning': return { className: 'bg-amber-500' };
      case 'info':
      default: return { className: 'bg-blue-500' };
    }
  };

  function getContrastYIQ(hexcolor: string) {
    if (!hexcolor || !hexcolor.startsWith('#')) {
      return '#ffffff';
    }

    let r, g, b;
    if (hexcolor.length === 4) {
      r = parseInt(hexcolor[1] + hexcolor[1], 16);
      g = parseInt(hexcolor[2] + hexcolor[2], 16);
      b = parseInt(hexcolor[3] + hexcolor[3], 16);
    } else if (hexcolor.length === 7) {
      r = parseInt(hexcolor.substring(1, 3), 16);
      g = parseInt(hexcolor.substring(3, 5), 16);
      b = parseInt(hexcolor.substring(5, 7), 16);
    } else {
      return '#ffffff';
    }
    
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
  }

  const styleProps = getStyleProps();
  const bgClass = 'className' in styleProps ? styleProps.className : '';

  if (!isVisible) return null;

  return (
    <div 
      className={`relative ${bgClass} text-white px-4 py-2 rounded-md shadow-lg z-50 max-w-md transform transition-all duration-300 ease-in-out ${isLeaving ? 'opacity-0 translate-x-2' : 'opacity-100'}`}
      style={'className' in styleProps ? {} : styleProps}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button
          onClick={() => {
            setIsLeaving(true);
            setTimeout(() => {
              setIsVisible(false);
              if (onClose) onClose();
            }, 300);
          }}
          className="ml-4 hover:text-gray-200"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;